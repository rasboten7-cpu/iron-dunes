# Latest: Command Console V16

Based on the user-supplied modified V15 archive. Preserve the supplied spectator, menu cleanup, map and supply changes. See UPDATE-V16.md, QA-V16.txt and ART-PROMPTS-V16.md. New interface skin and command artwork are in dist/assets/interface; mappings in hud-art.js; responsive layout in generals-ui.css. World models and simulation rules are unchanged.

# Current: Textured Architecture V15

See UPDATE-V15.md, ART-PROMPTS-V15.md and QA-V15.txt. New four-image raster atlases, per-face UVs, exported smooth normals, lower camera angle, V15 HUD marker and strict offline cache versioning. Meshes are still original offline-authored OBJ geometry. Do not describe them as professionally hand-sculpted assets or claim Generals-equivalent quality.

# Latest: Architecture Edition 14

Active buildings now load original static UV-mapped OBJ meshes through dist/architecture.js. Preserve this pipeline and the faction-specific silhouettes. See UPDATE-V14.md, QA-V14.txt, and tools/art/author_buildings.py. Earlier Zsky files remain bundled as historical assets but are not loaded by the active building renderer.

# Current handoff: Fires of War v12

Active base is the user-provided v11.1 archive, not v8. Read UPDATE-V12.md first. The v12 change is a presentation/movement pass; original v11.1 simulation systems remain in game.js. New stylesheet warfire.css overrides the original cascade. Assets are self-contained. New launcher is launch.py. Model cache version is fires-of-war-v12-final.

Do not use old v5/v6 notes below as a current feature inventory.

---

# IRON DUNES v5 — Handoff

## User and objective

The user (Arabic, RTL UI) wants a browser RTS as close as practical to Command & Conquer: Generals, **Skirmish mode only**: no campaign, no multiplayer, no other modes. v4 was produced by another assistant. v5 (this version) is a large upgrade that keeps all v4 accepted behaviour.

## Accepted requirements carried over from v4 (do not regress)

1. Skirmish 1v1 vs AI only.
2. Realistic pre-rendered artwork (2x2 four-view sprite sheets) drawn by a Canvas-2D renderer; no WebGL.
3. Left hold+drag pans the camera; short left click selects; Shift+left drag box-selects; right click issues orders.
4. Edge scrolling, WASD/arrows, wheel zoom, Q/E rotation.
5. Both sides start with HQ + one dozer only.
6. Dozer must physically reach a site and stay assigned for progress; moving/killing it pauses; another dozer can resume by right-clicking the site.
7. Production requires completed producers; player and AI use the same paid entry points (`requestConstruction`, `enqueueUnit`, `research`, `usePower`, `launchSilo`).
8. Large 388x388 playable world; enemy visible from the start (no fog of war); "show enemy base" button.

## v5 additions (summary)

- Weapon/armour matrix `VS` (rifle, mg, autocannon, cannon, rocket, howitzer, bomb vs infantry/light/heavy/structure).
- New units: `rocket` (anti-armour infantry), `heavy` (twin-cannon tank, needs radar). Tanks crush infantry. Artillery has min range and splash.
- Veterancy per unit (`e.vet` 0–3, `VET_*` tables); heroic self-heal.
- General rank per team (`RANKS`, `teamXP`, points) and 6 powers (`POWERS`, `usePower`). Doctrines (`DOCTRINES`) change costs/HP/cooldowns.
- Superweapon `silo` (limit 1, `SILO_TIME` 300 s, low power pauses charge); timers shown to both sides; `launchSilo` → `nuke` (hurts everything, including own units).
- Research upgrades (`UPGRADES`) queued in producer queues as `{research:true}` items.
- Civilian buildings (`type:'civilian'`, team 2 when empty) can be garrisoned by infantry (`enterBuilding`, `garrisonIn`, `evacuate`). Owner team switches while occupied; garrisoned units stay in `entities` with `e.inside`.
- Dozer repair (`assignRepair`), selling (`sell`, 50% refund / full refund for unfinished), rally points (`b.rally`), waypoint queue (`e.waypoints`), control groups (`groups`), double-click select-same-type.
- Victory: a team is defeated when it has no non-civilian buildings and no units other than supply trucks (`alive`, `checkVictory`). HQ can be rebuilt.
- AI (`makeAI`, `aiThink`, `aiEconomy`, `aiProduce`, `aiTactics`, `aiPowers`): build order with power margin, expansion refineries, turrets toward the enemy, silo, second factory/barracks when rich, counter-unit weights, upgrades, base defence, attack waves with retargeting, harvester raids, garrisoning, power and silo targeting via `bestCluster`. Difficulty affects cadence/caps; hard AI gets bonus income/money. AI powers are held back until 4.5–10 min depending on difficulty.
- Three point-symmetric maps in `world-config.js` (`MAPS`, `setMap`, `mapObstacles`): Iron Valley, Scorpion Pass, Palm Oasis. Rocks/groves are real navigation obstacles.
- Skirmish setup: map, doctrine, difficulty, starting money, superweapons on/off, game speed, lighting.

## Files

- `dist/index.html` — intro/setup, HUD, rank widget, superweapon timers, promotions panel, footer with 4 tabs (build/units/upgrades/powers).
- `dist/style.css` — v4 styles + v5 block at the end.
- `dist/game.js` — all simulation, AI, UI and input (sectioned with banner comments).
- `dist/visuals.js` — asset loading, team-tinted/wreck/ghost frame variants (baked once, no ctx.filter), scenery per map, decals, coloured particles, `ImageRenderer` (cached ground layer, depth-sorted sprites, custom `userData.draw` objects, canvas HUD bars/chevrons/pips, pixel-accurate `pick`), procedural jet/missile/parachute drawing, SVG icons.
- `dist/audio.js` — Web Audio synthesis (no audio files) + optional Arabic `speechSynthesis` announcements (silent if no Arabic voice is installed).
- `dist/world-config.js` — map definitions.
- `dist/three.module.js` — vendored Three.js r169, used only for camera/vector math and the scene graph container.
- `dist/assets/realism/*.png` — 17 original v4 assets (unchanged) + 4 derived v5 assets: `rocket.png`, `heavy.png`, `civilian.png`, `silo.png` (see `docs/art-assets.md`).
- `tools/art/*.py` — scripts that regenerate the derived assets (Python 3 + Pillow + NumPy).

## Implementation notes

- Navigation: buildings and map obstacles are rasterised into two `Uint16Array` count grids (unit radius classes 0.6 / 0.9) on add/remove. `pathTo` runs A* with a binary heap, then string-pulls with `lineClear`. Repaths are budgeted per sim step (`pathBudget`). Movement collision still uses the exact `blocked()` square test.
- The renderer draws everything from `scene.children`: asset roots (`userData.asset`) and custom objects (`userData.draw`, optional `layer:'ground'|'top'`). Effects are created via `addFx` and updated by `updateFx`. Game-time delays use `setTimeoutGame` (respects pause/speed).
- UI cards, queue and selection panel use event delegation on `pointerdown` and only rewrite innerHTML when content changes.
- Keyboard uses `KeyboardEvent.code` so shortcuts work with Arabic layouts.
- `window.game` exposes test hooks: `start(opts)`, `simulate(seconds)`, `snapshot()`, `entities()`, `teams()`, `spawn`, `kill`, `teamXP`, `usePower`, `launchSilo`, `research`, `enqueueUnit`, `requestConstruction`, `toScreen`, `settings` (`settings.aiBoth=true` makes both sides AI).

## Verification done for v5

Headless Chromium (Playwright): AI-vs-AI full games on all three maps finish with a winner (10–18 min), no page errors. Scripted player run covers: card build plus placement ghost, dozer construction, training via cards, F2 selection, control group, right-click move, rank-up and promotions, airstrike flight and bombs, silo launch and nuke, garrison/fire/eject, tank crush, dozer repair, sell refund, rally point, waypoints, veterancy, win and lose screens, restart, menu → other map with superweapons off. Median frame time is about 16 ms with 70 entities in combat.

## Not implemented (ideas if the user asks)

Fog of war (v4 explicitly wanted the enemy visible; could be an option), aircraft as controllable units, 2v2 / more AI players, walls/mines, saving and loading, touch-first controls.

## v6 notes
- `FACTIONS` + `FDEFS[f][type]` in game.js; always read unit stats via `D(type,team)` and faction traits via `FA(team)`.
- Power: `power(team)` / `powerShort(type,team)`; `requestConstruction` refuses when short. Sand (`noPower`) can't build `power`.
- Economy: no passive income; refinery completion spawns a free harvester (`spawnFrom(e,'harvester',true)`).
- Placement: `placeReason()` returns an Arabic reason or ''. Touch uses the screen-centre ghost (`centerGround`, `autoSpot`) + `#placeBar`.
- Units that end up inside a new footprint can always move (escape rule in the movement step).
- 3D: `models.js` builds Three.js models, `bakeFaction()` renders sprite atlases (IndexedDB cache `iron-dunes-models-v2`); `visuals.js` `ensureModels()` is awaited in `start()`.

## v7 notes
- Buildings are 3D too: `models.js` → `B.<type>_<faction>` (+ `airfield`, `speaker`, `tunnel`), baked by `bakeBuilding()` (1 frame, radar 8 animation frames via `model.spin`, turret heads 24/32 dirs in `turretAtlas` with `tdirs`). Cache key `iron-dunes-models-v3`.
- Faction-only content: `only:[faction]` on defs; use `avail(type,team)`. New weapon kinds: sniper, hack, flame, toxin, suicide (handled in `special()`); aircraft (`air:true`) fly straight, need `hitsAir()` weapons, altitude in `e.alt`.
- Hackers earn $6/2s when idle 3s; `building.off>timer` = disabled (no production/turret/aura/power).
- UI theme: CSS layer "v7" in style.css; `body[data-f]` sets `--fac`; menu faction cards built in game.js from `FACTIONS` (+`EMBLEM`), hero images `assets/web/hero_<faction>.webp`. Card portraits are cropped from the baked atlases (`icon(type,faction)` in visuals.js).

## v11 notes (remaining Generals features for all three factions)
- Capacity system: `capOf(b)` = `b.cap ?? D(b).capacity`. Holders: civilian (switches team), dragon `bunker`, `crawler` (noFire, crew of 8 spawned inside in `spawnFrom`), falcon `jeep` (humvee, capacity 5), sand `bus` (husk: first death → immobile bunker `e.husked`, `userData.wreck`), Overlord `bnk` add-on (`e.cap=5`). `canHold/enterBuilding/garrisonIn/evacuate`; passengers follow vehicles each tick and fire unless `D(holder).noFire`. `remove()` evacuates.
- Stealth: `updateStealth()` every 0.4 s sets `e.hidden` and `e.seenBy` (ally ids) — sniper `stealth:true`, sand infantry/rocket with `camo`. Detectors: `D.detector` (crawler 30), radar buildings 26, any unit 5. `canAttack` and AI threat lists respect it; `hudFrame` hides enemy hidden units / draws own at 45% opacity.
- Stun: `e.stun>timer` freezes units (leaflets, EMP). EMP also sets `building.off` and destroys aircraft.
- Overlord add-ons: `ADDONS`, `addAddon(e,k)` swaps the sprite with `reskin()` (model keys `heavy_gat|heavy_spk|heavy_bnk`); `gatFire()` = secondary AA gattling; `spk` = heal aura.
- Mines: global `mines[]` (cluster-mine power, `addMine`) + building `e.mines` charges (`mines` upgrade); `checkMines()` every 0.25 s.
- New weapons flags: `rad` (radPool), `toxic` (scud), `toxinshells`, `w.muzzle`. `damageOf(e,t,w)` and `canAttack(e,o,w)` take the weapon.
- New models in models.js: crawler, battleBus, scudLauncher, nukeCannon, overlord(add), B.bunker. Cache `iron-dunes-models-v7`. visuals.js FALLBACK/dimensions updated.
- AI: `aiTransports`, `aiBunkers`, addon purchase in `aiProduce`, research throttled (`ai.resT`, niche upgrades after 6 min), earlier 2nd factory/barracks, powers cashhack/sneak/leaflet targeting, reactor overcharge when power is low.
- Tests: tools/feat11.mjs (features), tools/ai11.mjs (AI vs AI).

## Map size note (after V15)
- `dunes` (الكثبان الكبرى) is now 1200×1200 world units (limit 600, about 1.5 km). Nav grid half-size `GL=610` in game.js and A* cap 260000 cover it; `gen({forward:true})` adds a forward expansion deposit per base. Keep GL ≥ largest map limit + 10.

## Map sizes (after V16)
- Sized by player count like Generals: 2-player maps 800x800 units (limit 400, ~1 km), 4-player 1000x1000 (limit 500, ~1.25 km), 6-player 1200x1200 (limit 600, ~1.5 km). Scale: 1 unit ~ 1.25 m. Nav grid GL=610 covers limit 600.
- AI cancels and refunds any construction site with no progress for 90 s (unreachable spots on big maps).

## v18 — GLA-style Sand economy (worker gatherers)
- Sand has no supply trucks: `builder` (عامل, $200) has `gatherer:true`, is also trained at the supply stash (`also:['refinery']`) and gathers 100 per trip (150 with logistics, 2.8s load). Idle AI workers gather; `aiEconomy` pulls the nearest empty-handed worker to build. A finished stash gives 2 free workers instead of a truck.
- Player: right-click a deposit or own stash with workers → gather; any move order stops gathering.
- `aiTunnels`: hurt AI ground units (<40%) within 70 of a tunnel dive in to heal and come out at the tunnel nearest the staging point (`exitSome`).
- AI anti-air weights now scale with the number of armed enemy aircraft (unarmed Chinooks no longer count). Impossible Sand researches GLA upgrades from 4 min, builds a 3rd arms dealer and black markets earlier.
- Test (Sand impossible vs Falcon hard, 6 maps): 3 wins Sand, 2 Falcon (both on pass), 1 draw — was 0/6.
