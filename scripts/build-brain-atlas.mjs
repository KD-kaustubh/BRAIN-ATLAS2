/** Build the brain-only atlas from a BodyParts3D whole-body atlas export.
 *
 *   node scripts/build-brain-atlas.mjs [path-to-human-atlas]
 *
 * Reads the source manifest, keeps every mesh of the nervous system, regroups it
 * into brain regions, recenters and scales the geometry onto the viewer stage,
 * and repacks it into compact chunks.
 */
import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';

const source = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, '..', '..', 'human-atlas'));
const sourceModels = path.join(source, 'public', 'models');
const outModels = path.join(import.meta.dirname, '..', 'public', 'models');

/** Stage placement: the source anatomy is a whole body in metres, Y-up. STAGE_Y must match STAGE in app/anatomy.ts. */
const SCALE = 7.5;
const STAGE_Y = 0.65;
const CHUNK_TARGET = 1_600_000;

/** Ordered name rules. Every kept mesh must match exactly one region. */
const REGION_RULES = [
	[/tentorium|falx|dura mater|arachnoid|pia mater/i, 'meninges'],
	[/ventricle|aqueduct|central canal|choroid plexus/i, 'ventricles'],
	[/cerebellum|cerebellar/i, 'cerebellum'],
	[/nerve|ganglion|optic chiasm|optic tract/i, 'cranialnerves'],
	[/gyrus|lobule|\blobe\b|insula|cortex/i, 'cortex'],
	[/corpus callosum|commissure|internal capsule|white matter|fornix|\bstria\b/i, 'whitematter'],
	[/amygdala|hippocampus|caudate|putamen|globus pallidus|septum|accumbens|claustrum/i, 'limbic'],
	[/thalamus|hypothalamus|habenula|geniculate|mammillary|tuber cinereum|lamina terminalis|subthalamic/i, 'diencephalon'],
	[/midbrain|\bpons\b|medulla oblongata|peduncle|colliculus|interpeduncular|tegmentum|substantia nigra|red nucleus/i, 'brainstem'],
];

const region = name => {
	for (const [pattern, id] of REGION_RULES) if (pattern.test(name)) return id;
	throw new Error(`No brain region rule matched "${name}". Add a rule to REGION_RULES.`);
};

const atlas = JSON.parse(fs.readFileSync(path.join(sourceModels, 'atlas.json')));
const kept = atlas.parts.filter(p => p.system === 'nervous');
if (!kept.length) throw new Error('The source atlas contains no nervous system meshes.');

const buffers = new Map();
const chunkBuffer = index => {
	if (!buffers.has(index)) {
		const file = path.join(sourceModels, path.basename(atlas.chunks[index].url));
		const raw = fs.readFileSync(file);
		if (raw.length !== atlas.chunks[index].bytes) throw new Error(`${file} is incomplete.`);
		buffers.set(index, raw);
	}
	return buffers.get(index);
};

/** Centre the collection on the stage so the shared camera framing still applies. */
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const p of kept)
	for (let axis = 0; axis < 3; axis++) {
		min[axis] = Math.min(min[axis], p.bounds[0][axis]);
		max[axis] = Math.max(max[axis], p.bounds[1][axis]);
	}
const centre = min.map((v, i) => (v + max[i]) / 2);
const place = (value, axis) => (value - centre[axis]) * SCALE + (axis === 1 ? STAGE_Y : 0);

const align = n => n + ((4 - (n % 4)) % 4);
const chunks = [];
const parts = [];
let writer = {parts: [], bytes: 0};
let triangles = 0;

const flush = () => {
	if (!writer.parts.length) return;
	const buffer = Buffer.alloc(writer.bytes);
	for (const entry of writer.parts) {
		buffer.set(entry.positions, entry.part.positions);
		buffer.set(entry.normals, entry.part.normals);
		buffer.set(entry.indices, entry.part.indices);
	}
	const name = `brain-${chunks.length}.bin`;
	fs.writeFileSync(path.join(outModels, name), buffer);
	const compressed = gzipSync(buffer, {level: 9});
	fs.writeFileSync(path.join(outModels, `${name}.gz`), compressed);
	chunks.push({url: `/models/${name}`, bytes: buffer.length, gzip: `/models/${name}.gz`, gzipBytes: compressed.length});
	writer = {parts: [], bytes: 0};
};

for (const part of kept.slice().sort((a, b) => a.id.localeCompare(b.id))) {
	const raw = chunkBuffer(part.chunk);
	const sourcePositions = new Float32Array(raw.buffer, raw.byteOffset + part.positions, part.vertexCount * 3);
	const normals = Buffer.from(raw.buffer, raw.byteOffset + part.normals, part.vertexCount * 3 * 2);
	const indices = Buffer.from(raw.buffer, raw.byteOffset + part.indices, part.indexCount * 4);

	const positions = new Float32Array(sourcePositions.length);
	const low = [Infinity, Infinity, Infinity];
	const high = [-Infinity, -Infinity, -Infinity];
	for (let i = 0; i < positions.length; i++) {
		const axis = i % 3;
		const value = place(sourcePositions[i], axis);
		positions[i] = value;
		low[axis] = Math.min(low[axis], value);
		high[axis] = Math.max(high[axis], value);
	}

	const positionOffset = align(writer.bytes);
	const normalOffset = align(positionOffset + positions.byteLength);
	const indexOffset = align(normalOffset + normals.length);
	const placed = {
		id: part.id,
		name: part.name,
		conceptId: part.conceptId,
		system: region(part.name),
		chunk: chunks.length,
		positions: positionOffset,
		normals: normalOffset,
		indices: indexOffset,
		vertexCount: part.vertexCount,
		indexCount: part.indexCount,
		bounds: [low, high],
	};
	writer.parts.push({part: placed, positions: Buffer.from(positions.buffer), normals, indices});
	writer.bytes = indexOffset + indices.length;
	parts.push(placed);
	triangles += part.indexCount / 3;
	if (writer.bytes >= CHUNK_TARGET) flush();
}
flush();

const ids = new Set(parts.map(p => p.id));
const concepts = atlas.concepts
	.map(c => ({...c, elements: c.elements.filter(id => ids.has(id))}))
	.filter(c => c.elements.length);

const output = {
	version: '1.0',
	source: 'BodyParts3D 4.0',
	scope: 'Human brain, brainstem, cerebellum, and associated cranial nerves',
	parts,
	concepts,
	chunks,
	triangles,
};
fs.writeFileSync(path.join(outModels, 'atlas.json'), JSON.stringify(output));

const counts = {};
for (const p of parts) counts[p.system] = (counts[p.system] ?? 0) + 1;
const download = chunks.reduce((n, c) => n + c.gzipBytes, 0);
console.log(`${parts.length} meshes, ${concepts.length} concepts, ${triangles.toLocaleString()} triangles`);
console.log(`${chunks.length} chunks, ${(download / 1e6).toFixed(1)} MB compressed download`);
console.log(counts);
