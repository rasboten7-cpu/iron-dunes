# V15 art source and prompt set

Created with the built-in image generation tool. These are raster material atlases mapped onto the actual 3D OBJ meshes; no image-to-3D service or professional third-party model pack is claimed.

Shared prompt: photorealistic-natural; production diffuse UV texture atlas; square 2048×2048; exact flush 2×2 grid; no gutters, labels, perspective, people, whole-building renders or cast object shadows; front-facing orthographic surfaces; neutral diffuse lighting; readable details at RTS scale.

1. `falcon-atlas.png`: upper left worn pale military concrete facade, three metal-framed windows, utility double door, blue trim, chipped paint, exposed aggregate and conduits. Upper right worn zinc corrugated roof. Lower left worn concrete paving with cracks and faint yellow utility markings. Lower right metal vents, ducts, rivets and service hatches.
2. `sand-atlas.png`: upper left aged ochre plaster and sandstone courtyard facade, three arched windows, carved stone borders, wooden arched doorway, faded green frieze. Upper right aged sandstone roof material. Lower left sandy courtyard flagstones. Lower right sun-faded green stitched canvas.
3. `dragon-atlas.png`: upper left aged sandstone/gray plaster military facade with barred windows, reinforced door, red frieze and stone plinth. Upper right worn overlapping gray-brown ceramic roof tiles. Lower left weathered concrete slabs. Lower right gray industrial steel with red details, vents and pipes.
4. `details-atlas.png`: upper left neutral weathered industrial concrete with flaking paint and runoff. Upper right riveted aged galvanized metal. Lower left coarse wooden crate planks and metal banding. Lower right pale sandstone blocks with plaster remnants.

All images live in `dist/assets/architecture/`. Runtime quadrant extraction uses canvas and retains their content. OBJ authoring and UV/normal export source: `tools/art/author_buildings.py` (Python + numpy for re-export only). Normal gameplay uses bundled JavaScript assets and does not need numpy.
