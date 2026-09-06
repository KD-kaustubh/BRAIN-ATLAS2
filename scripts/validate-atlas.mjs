import fs from 'node:fs';
import assert from 'node:assert/strict';
const base = new URL('../public/models/', import.meta.url);
const atlas = JSON.parse(fs.readFileSync(new URL('atlas.json', base)));
const regions = new Set(['cortex', 'whitematter', 'limbic', 'diencephalon', 'brainstem', 'cerebellum', 'ventricles', 'cranialnerves', 'meninges']);
const ids = new Set(atlas.parts.map(p => p.id));
assert.ok(atlas.parts.length, 'the atlas contains no meshes');
assert.equal(ids.size, atlas.parts.length, 'mesh identifiers are not unique');
const files = atlas.chunks.map(c => {
	const b = fs.readFileSync(new URL(c.url.split('/').pop(), base));
	assert.equal(b.length, c.bytes);
	return b;
});
let tris = 0;
for (const p of atlas.parts) {
	assert.ok(p.name.trim() && p.name !== '-' && !p.name.includes('Bounds('));
	assert.ok(p.conceptId !== '-');
	assert.ok(regions.has(p.system), `${p.id}: unknown region ${p.system}`);
	const b = files[p.chunk];
	assert.ok(p.indices + p.indexCount * 4 <= b.length, `${p.id}: buffer overrun`);
	assert.equal(p.positions % 4, 0, `${p.id}: unaligned positions`);
	assert.equal(p.normals % 2, 0, `${p.id}: unaligned normals`);
	assert.equal(p.indices % 4, 0, `${p.id}: unaligned indices`);
	const pos = new Float32Array(b.buffer, b.byteOffset + p.positions, p.vertexCount * 3);
	const indices = new Uint32Array(b.buffer, b.byteOffset + p.indices, p.indexCount);
	assert.ok(indices.length >= 3);
	for (const i of indices) assert.ok(i < p.vertexCount, `${p.id}: invalid vertex`);
	for (let i = 0; i < pos.length; i++) {
		assert.ok(Number.isFinite(pos[i]), `${p.id}: non-finite coordinate`);
		const axis = i % 3;
		assert.ok(pos[i] >= p.bounds[0][axis] - 1e-4 && pos[i] <= p.bounds[1][axis] + 1e-4, `${p.id}: coordinate outside bounds`);
	}
	tris += p.indexCount / 3;
}
for (const c of atlas.concepts) {
	assert.ok(c.elements.length);
	for (const id of c.elements) assert.ok(ids.has(id), `${c.id}: missing ${id}`);
}
assert.equal(tris, atlas.triangles);
const present = new Set(atlas.parts.map(p => p.system));
for (const r of regions) assert.ok(present.has(r), `region ${r} has no meshes`);
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const p of atlas.parts)
	for (let axis = 0; axis < 3; axis++) {
		min[axis] = Math.min(min[axis], p.bounds[0][axis]);
		max[axis] = Math.max(max[axis], p.bounds[1][axis]);
	}
const size = max.map((v, i) => v - min[i]);
assert.ok(Math.max(...size) > 0.6 && Math.max(...size) < 2.4, `the brain does not fit the stage: ${size}`);
assert.ok(Math.abs((min[1] + max[1]) / 2 - 0.65) < 0.01, 'the brain is not centred on the stage');
assert.ok(min[1] > -0.01 && min[1] < 0.08, `the brain does not rest on the stage: lowest point ${min[1].toFixed(3)}`);
console.log(
	`Verified ${ids.size} individually indexed meshes across ${regions.size} regions, ${atlas.concepts.length} concept mappings, ${tris.toLocaleString()} triangles, and every binary buffer.`,
);
