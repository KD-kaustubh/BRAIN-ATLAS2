# Anatomy data attribution

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

- License: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html (updated 2025-02-27)
- Dataset: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
- License terms: https://creativecommons.org/licenses/by/4.0/
- Source geometry: `isa_BP3D_4.0_obj_99.zip`, BodyParts3D 4.0.
- English names and relationships: IS-A and PART-OF concept, element, and inclusion tables from the same archive.
- Publication: Mitsuhashi et al. (2009), BodyParts3D: 3D structure database for anatomical concepts. https://doi.org/10.1093/nar/gkn613

Scope: this atlas contains the nervous-system meshes of the source anatomy — the cerebral hemispheres, deep grey matter, white-matter tracts and commissures, diencephalon, brainstem, cerebellum, ventricular spaces, meningeal folds, and the cranial nerves and orbital nerve branches represented in the source. All 139 such source meshes remain represented, mapped to 308 named FMA concepts. Peripheral nerves outside the head, the spinal cord below its central canal segment, and all non-neural structures are excluded.

Adaptations: axes and units converted from millimeters/Z-up to meters/Y-up; geometry simplified using meshoptimizer with a 0.2% relative error limit per structure; normals quantized to signed 16-bit; the collection recentred and uniformly scaled by 7.5 to rest on the viewer stage; packed into binary chunks; curated brain-region groupings and colors. Original source identity is preserved in the manifest, and no vertex is added, removed, or moved relative to its neighbours by the placement transform.

BodyParts3D represents an adult male reference anatomy based on TARO MRI and anatomical illustration refinements. It is not a complete model of every possible human neural structure or variation, and it models gross anatomy rather than the cortical parcellations, individual nuclei, or fibre tracts resolved by imaging-derived brain atlases. This interface is educational and is not a clinical, surgical, or neuronavigation tool.

Source OBJ comments mention an older CC BY-SA 2.1 Japan license. The official current database license linked above supersedes that legacy text and explicitly permits redistribution and adaptation under CC BY 4.0.

## Viewer

The viewer is adapted from Human Atlas (https://github.com/ashemag/human-atlas) by ashemag, MIT License. See LICENSE.
