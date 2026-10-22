# IRON DUNES — Realistic artwork update

All artwork was created with the built-in `image_gen` tool and integrated into the live game. No CLI/API fallback was used. The original generated PNG alpha channels are preserved. The game uses a projected 2.5D image renderer with four directional views, rather than claiming these are new fully modeled 3D objects.

## Saved asset paths

The 17 source images are stored in `/workspace/sites/iron-dunes-skirmish/dist/assets/realism/`.

| Filename | Production subject / prompt specification |
| --- | --- |
| hq.png | Fortified two-story modern military command center, concrete bunker, satellite dish, antennas, blast doors, HVAC and sandbags. |
| power.png | Military diesel power station, twin exhaust stacks, generators, transformers, cables and armored control shed. |
| refinery.png | Military logistics depot, cylindrical fuel tanks, loading platform, pipelines, warehouse and pallets. |
| barracks.png | Army accommodation block, weathered beige concrete, green metal roof, windows, canopy and air conditioners. |
| factory.png | Armored vehicle factory, reinforced vehicle bays, hangar roof, maintenance gantry and loading apron. |
| turret.png | Fortified twin-autocannon turret, armored mount, optics, ammunition boxes and bunker base. |
| radar.png | Military parabolic radar dish, electronics shelter, control equipment and cables. |
| builder.png | Military engineering bulldozer, tracked undercarriage, hydraulic arms, broad steel blade, glazed cab and ochre paint. |
| infantry.png | Modern infantry soldier, realistic camouflage, helmet, tactical carrier, pouches, boots and low-ready rifle. |
| jeep.png | Armored reconnaissance jeep, off-road tires, reinforced glass and roof machine gun. |
| tank.png | Main battle tank, 120 mm cannon, composite sloped armor, tracks, optics and dusty camouflage. |
| artillery.png | Tracked self-propelled artillery, long howitzer barrel, armored turret and realistic tracks. |
| harvester.png | Six-wheel military supply truck, armored cab, crate-loaded cargo bed and large off-road tires. |
| ground.png | Seamless top-down photographic arid soil, tan gravel, fine sand, pebbles, flat even lighting, no objects or directional shadows. |
| palm.png | Single mature date palm, curved rough trunk, dense dusty-green fronds, dry fronds and photographic bark. |
| rocks.png | Compact cluster of layered sandstone and limestone boulders, sedimentary strata and loose stones. |
| supplies.png | Compact cache of weathered wooden shipping crates, metal containers, canvas pallets, ropes and cargo straps. |

## Shared final prompt set

For the thirteen unit/building assets: one square image with exactly four equal cells in a 2x2 grid; front-right, rear-right, rear-left, front-left three-quarter views of the same subject. Fixed orthographic camera at 50 degrees above the horizon, matching scale and design across views, full object visible. Photorealistic pre-rendered military RTS asset, physically based weathered materials, panel lines, bolts, vents, chipped paint, dirt and realistic muted colors. Neutral upper-left sunlight. Genuine transparent background, no grid, text, logos, landscape, checkerboard, toy proportions or cartoon styling.

For the palm, rock and supply assets: one isolated complete subject rather than a sheet; matching 50-degree orthographic camera and neutral lighting; genuine alpha background and realistic photographic surface detail.

For the ground: a seamless, edge-to-edge top-down material texture with uniform illumination; no perspective or objects.

## Integration and validation

- `dist/visuals.js`: original-image preload, four-view artwork selection, alpha-aware selection, projected terrain and sprites, and cached display frames.
- `dist/game.js`: left hold-and-drag pans the camera; left click selects; Shift-drag selects groups; right click issues orders.
- Construction, producer prerequisites, worker loss/resume and AI production were tested in simulation.
- Browser QA confirmed loading, left camera dragging, image selection and worker-built power station completion.
- `docs/gameplay-preview.jpg`: screenshot of the running updated game, not concept art.

## v5 derived assets

Four additional sheets were derived from the original artwork (no new image generation), using the scripts in `tools/art/` (Python 3, Pillow, NumPy). They use the same 2x2 four-view layout and alpha channel conventions.

| Filename | Source / method |
| --- | --- |
| rocket.png | `infantry.png` recoloured to desert-tan camouflage, plus a shaded shoulder-fired launcher tube painted per view (`tools/art/rocket.py`). |
| heavy.png | `tank.png` recoloured to a dark charcoal-olive scheme. Rendered 1.3x larger in game as the twin-cannon heavy tank (`tools/art/variants.py`). |
| civilian.png | `barracks.png` with a terracotta roof and whitewashed walls, for the garrisonable civilian buildings (`tools/art/variants.py`). |
| silo.png | Procedurally rendered missile silo: octagonal pad, blast doors, hazard ring, control bunker and tanks, drawn with a small orthographic face renderer at the same 50° camera (`tools/art/silo.py`). |

Team colours, wrecks and placement ghosts are generated at runtime by tinting cached frames (`visuals.js`, `variant()`); the original files are untouched.
