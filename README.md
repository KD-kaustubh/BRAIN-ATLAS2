# Brain Atlas

An interactive 3D atlas of the human brain, built with React, Three.js, and shadcn/ui. Take the brain apart into **139 individually selectable structures**, explore **9 anatomical regions**, and search **308 named concepts** — from cortical gyri and deep nuclei to the brainstem, cerebellum, ventricular spaces, and cranial nerves.

## Explore

- Orbit, zoom, and select structures directly on the brain.
- Toggle regions, or jump to the cortex, deep brain, and brainstem presets.
- Move from the assembled brain to a spaced inventory of every visible structure.
- Switch between oblique, anterior, lateral, superior, and posterior views.
- Search anatomical names and FMA identifiers.
- Isolate a selected structure and read its description.
- Use compact controls and detail panels on mobile.

The interface is a dark imaging-console layout: a docked region rail, a docked inspector that the rest of the layout makes room for, and monospaced readouts.

## Run locally

Requires Node.js 22.13 or newer. No API keys or accounts are needed.

```sh
npm ci
npm run dev
```

Open http://localhost:3017. To build the static site, run `npm run build`; the output is in `dist/`.

## Validate

```sh
npm run check
npm run validate
node scripts/validate-interactions.mjs
npm run build
```

Validation covers mesh buffers and byte alignment, region membership, stage placement, concept mappings, nonoverlapping exploded layouts at desktop and mobile aspect ratios, search and inspection contracts, and tap-versus-drag handling. Physical-device performance and real multitouch hardware have not been tested.

## Regions

Every mesh is assigned to one of nine display regions, which drive the layer toggles, the colours, and the grouping used while the brain separates:

| Region | Contents |
| --- | --- |
| Cerebral cortex | Gyri, lobes, and the insula |
| White matter | Corpus callosum, commissures, internal capsule, fornix, striae, hemispheric white matter |
| Basal ganglia & limbic | Caudate, putamen, globus pallidus, amygdala, hippocampus, septum |
| Diencephalon | Thalamus, hypothalamus, habenula, geniculate bodies, mammillary bodies |
| Brainstem | Midbrain, pons, medulla oblongata, peduncles, colliculi |
| Cerebellum | Cerebellar hemispheres |
| Ventricular spaces | Cerebral aqueduct, central canal |
| Cranial nerves | Optic pathway, oculomotor and trochlear nerves, ophthalmic branches, ciliary ganglia |
| Meninges | Tentorium cerebelli (hidden by default) |

## Anatomy data

The viewer uses the nervous system of **BodyParts3D 4.0**, an adult reference anatomy, licensed **CC BY 4.0**. It models gross anatomy: it does not represent every neural structure or variation, and it does not resolve cortical parcellations, individual nuclei, or fibre tracts the way imaging-derived atlases do. Individual source meshes are distinct from named concepts, which may group several meshes.

Geometry is simplified for browser performance while retaining every source mesh. The packaged model contains 201,226 triangles and downloads approximately 2.8 MB of compressed geometry. Full credits, source links, and adaptation details are in [ATTRIBUTION.md](public/ATTRIBUTION.md).

This is an educational explorer, not a diagnostic, surgical, or neuronavigation tool.

## How it works

Geometry is merged into batches. Per-structure GPU textures control translation, visibility, and selection, while component geometry supports accurate picking. Exploded layouts pack only the visible structures. Rendering updates when the scene changes; orbit controls remain responsive without hundreds of separate draw calls.

The optional WebMCP tools expose structure search and inspection in compatible browsers. The visible interface works without them.

## Rebuilding geometry

`public/models/` already contains browser-ready geometry, so rebuilding is optional. The build step reads a whole-body BodyParts3D export produced by the upstream Human Atlas project, keeps every nervous-system mesh, assigns each one to a display region, recentres and scales the collection onto the viewer stage, and repacks it into compact chunks:

```sh
node scripts/build-brain-atlas.mjs ../human-atlas
```

`STAGE_Y` in that script and `STAGE` in `app/anatomy.ts` describe the same stage height and must be changed together.

## Deploy

Import this repository into Vercel as a Vite project. The included `vercel.json` configures `npm ci`, `npm run build`, and the `dist` output directory. It can also be served by any static host.

## Credits

The viewer is adapted from [Human Atlas](https://github.com/ashemag/human-atlas) by ashemag, released under the MIT License. This project rescopes it to the brain: brain-region grouping and colours, region-specific descriptions, anatomical view presets, and a rebuilt geometry pipeline.

## License

Original application code is released under the [MIT License](LICENSE). **The anatomy data has its own CC BY 4.0 license**; preserve the attribution when redistributing it. Third-party dependencies retain their respective licenses.
