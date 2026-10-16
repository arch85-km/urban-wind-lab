# Architecture

How Urban Wind Lab is put together: what lives where, how a massing model
becomes a wind field, and what the tooling around it does. For the method
behind the numbers, every constant the solver uses and what it does not
model, read the
[method notes](docs/urban-wind-lab-method-notes.html). This file is the map.

## One file

`urban-wind-lab.html` is the application and the deliverable. Nothing builds
it: it is edited directly, and the copy in the repository is the copy
uploaded to the website. It bundles no third-party code and makes no network
requests. The renderer, the solver and both file parsers are written from
scratch.

| Part | Size | What it holds |
|---|---|---|
| Head | 7 KB | The licence comment, the meta tags, and the cube icon as two base64 PNG data URIs (4.4 KB) |
| `<style>` | 38 KB | All styling, scoped under `#ucfd-root` |
| Markup | 32 KB | The interface, plus a short inline script that sets the theme before the first paint |
| Main `<script>` | 170 KB | The application, in one IIFE |
| **Total** | **246 KB** | |

Everything is scoped under `#ucfd-root`, so the file can be pasted into a
WordPress Custom HTML block without reaching the rest of a theme. `boot`
decides whether the file owns the page (standalone) or sits inside one
(embedded, where a `data-height` attribute sets the height). A
`data-ucfd-mounted` flag stops a second copy on the same page from starting.

## Conventions

- Units are metres and metres per second. **+X is east, +Y is north, +Z is
  up.**
- Wind direction is the direction the wind comes **from**, in degrees
  clockwise from north (the meteorological convention). `windVector` turns
  it into the direction the air travels.
- The reference speed is defined at **10 m**, the height weather stations
  report. The inlet profile is normalised to it.
- The solved field is stored **normalised**: velocity as U/U<sub>ref</sub> and
  pressure as the pressure coefficient Cp. Changing the wind speed rescales
  the result at once rather than starting a new solve, which holds because
  separation from sharp edges does not depend on the Reynolds number.
- The release is defined once, at the top of the main script, as
  `VERSION` and `RELEASED` (ISO date). `releaseLabel` prints it long-form.
  `CITATION.cff`, the README and the method notes repeat it, and the release
  guard checks every copy.

## The main script

Its sections are numbered in the source; search for the heading.

| Section | What it does |
|---|---|
| 1 Utilities, 1b matrix maths, 1c colour ramps | Compass sectors, the Beaufort scale, 4×4 matrices, the viridis and diverging ramps, the themes, and the Lawson comfort table (`LAWSON`, `lawsonIndex`) |
| 2 WebGL2 renderer | `Renderer` compiles the shaders. `GLSL_FIELD` samples the solved field from a 3D texture and colours it for the active display mode |
| 2b GPU streamline tracers | `makeParticles`: tracers advected through the field on the GPU with transform feedback, drawn as instanced lines |
| 3 Geometry, 3b OBJ loader, 3c voxeliser | The domain (`gridFor`), the sample district (`buildSampleCity`), `parseOBJ`, `placeMesh` and `voxelize` |
| 4 Lattice-Boltzmann solver | `SolverBody`, and `createSolver`, which starts it in a Worker |
| 5 Application, 5b Analysis | `state`, the display modes (`FIELD_MODES`), the views, the area of interest (`computeSite`), drawing (`drawScene`), and the statistics (`analyseField`) |
| 6 Panels and readouts | Legend, statistics, the live Method panel, probes, the direction dial and the compass |
| 7 Weather | `parseEPW` and the wind rose (`drawRose`, `roseClick`) |
| 8–11 | State changes (`setSpeed`, `setDirection`, `setRoughness`, `setGeometry`, `setGrid`), solver messages, camera, file imports |
| 12 PNG export | `exportPNG` |
| 13 Guided tour | Six steps, `openTour` and `showTourStep` |
| 14–16 | Wiring (`bindUI`), the custom select menus, layout (`applyResponsive`), and `boot` |

## The domain

The lattice covers **240 × 240 m** in plan and about **90 m** in height
(`SITE`, `DOMAIN_H`). The cell size follows from the resolution preset:

| Preset | Lattice | Cell | Pedestrian sample height |
|---|---|---|---|
| Fast | 64 × 64 × 24 | 3.75 m | 1.88 m |
| Balanced (default) | 88 × 88 × 33 | 2.73 m | 1.36 m |
| Detailed | 112 × 112 × 42 | 2.14 m | 1.07 m |

The "pedestrian level" is the cell centre nearest 1.5 m
(`pedestrianLayer`), and the results panel shows the height actually
sampled.

The lattice keeps a margin of open ground around the model so that the inlet
and outlet do not disturb it. `computeSite` sets an area of interest, the
model's bounds plus 30 m in plan and 18 m above. Section planes, the comfort
plane and the statistics are clipped to it.

## The solver

`SolverBody` is written as a plain function. `createSolver` turns its source
into a Blob, starts it as a Web Worker, and, if the host page forbids Blob
workers, runs the identical code on the main thread with a smaller time
budget (46 ms of stepping per slice in the Worker, 9 ms inline).

| Element | In the code | Source |
|---|---|---|
| Lattice | D3Q19 (`EX`, `EY`, `EZ`, `W`) | — |
| Collision | BGK, single relaxation time `TAU0 = 0.51` | Bhatnagar, Gross & Krook (1954) |
| Sub-grid model | Smagorinsky, `C = 0.14` (`CS2 = 0.0196`), τ raised locally from the non-equilibrium second moment, clamped at 1.6 | Smagorinsky (1963); Hou et al. (1996) |
| Inlet | Logarithmic atmospheric boundary layer, `log((z + z0)/z0)` normalised to `ZREF = 10` m, at lattice speed `UREF_LAT = 0.045` | — |
| Boundaries | Inlet on every upwind face, zero-gradient outflow downwind, driven free stream across the top (`applyBoundaries`); half-way bounce-back on solids and the ground | — |
| Terrain | Four roughness classes set `z0` | — |

The full reference list, and how each reference was checked, is in the
method notes.

**A run, end to end:**

1. `boot` builds the sample district (`buildSampleCity`, seeded with a fixed
   `lcg` so every student gets the same model) and meshes it
   (`boxesToMesh`).
2. `voxelize` burns the triangles onto the lattice in two passes. A surface
   pass keeps thin walls, and a parity fill along Z makes closed massing
   solid inside. The result is the bounce-back mask.
3. `createSolver` starts the solver, and the main thread sends it `init` with
   the grid, the mask, the wind direction and `z0`.
4. In the Worker, `allocate` and `initField` fill the lattice with the inlet
   profile at equilibrium. `pump` then runs `lbmStep` (collide and stream)
   and `applyBoundaries` within its time budget.
5. About every 110 ms, `report` packs velocity (as U/U<sub>ref</sub>) and Cp
   into one Float32Array, computes the residual, and transfers the buffer to
   the main thread. The main thread hands buffers back (`recycle`) so they
   are reused.
6. `onSolverMessage` uploads the field as a 3D texture and runs
   `analyseField`. That sets the legend range from what is on screen, and
   computes the pedestrian-level mean, maximum, amplification, calm share
   (below 1.5 m/s) and the Lawson distribution.
7. "Steady state" is shown when the step passes 260 and the residual falls
   below 0.0022. The solve itself never stops. If density leaves 0.2–5, the
   solver halts and reports divergence.

Changing the direction or the roughness sends `wind`, which re-initialises
the field. Changing the geometry sends `solid`, and changing the preset
re-voxelises and sends `init` again. Changing the speed sends nothing.

## Reading the result

- **Display modes** (`FIELD_MODES`): speed, the signed Ux, Uy and Uz, Cp,
  and amplification (U/U<sub>10</sub>). Each has its own ramp, and the range
  can be locked so two schemes share a scale.
- **Section planes** on X, Y and Z, coloured by the active mode in the
  shader.
- **Tracers**: 8k to 150k (`DENSITIES`), seeded through the domain and
  weighted towards the lower atmosphere. If the frame time stays above
  70 ms, the count steps down, up to three times.
- **Lawson comfort** on the pedestrian plane: seven classes, from frequent
  sitting below 2.5 m/s to unsafe above 15 m/s.
- **Probes**: a click casts a ray (`pickPoint`) against the ground, the
  section planes, the comfort plane and the buildings, and pins the field
  values at the nearest hit. A hit on a wall reads the air just outside it.
  Two probes are kept at a time and compared; a third replaces the oldest.
- **Views**: isometric, plan, section and eye level (`VIEWS`). The camera
  orbits, pans and zooms with a mouse, and pinches on a touch screen.

## Files the user brings

Both are read locally with `FileReader`. Nothing is uploaded.

- **OBJ** (up to 48 MB): `parseOBJ` reads `v`, `vn` and `f` in any of the four
  face formats, with n-gon fans and negative indices, and ignores materials.
  `placeMesh` converts the units (metres, millimetres, centimetres, feet or
  inches), can rotate Y-up to Z-up, centres the model, can scale it to fit,
  and seats it on the ground.
- **EPW** (up to 24 MB): `parseEPW` reads the location line and every hourly
  record's wind direction and speed into 16 sectors with mean, 90th
  percentile and peak. Clicking a sector of the rose drives the solve from
  that direction at the chosen statistic.

## Export

`exportPNG` draws the figure itself rather than grabbing the screen, so the
legend comes with it. It re-renders the scene at the chosen multiple, up to
the device's largest render buffer, and redraws thin tracer lines at
sub-pixel offsets at print scales. The caption gives the wind and the
settings, the legend sits on its own row, and the credit line reads
"© Karam Al-Obaidi · Teaching tool — not a substitute for validated CFD or
wind-tunnel testing".

## What the browser stores

Two `localStorage` keys, both optional, and both wrapped so a private window
works without them:

- `ucfd-theme`: the light or dark presentation, once chosen. Until then the
  app follows the system setting.
- `ucfd-tour-optout`: set when the user turns the guided tour off. Otherwise
  the tour opens on every launch.

## Scripting the embed

`window.UrbanWindLab` exposes the version, the release date, the state,
`setWind`, `setTheme`, `setField`, `exportPNG` and the solver mode.
`window.UrbanCFDStudio` is kept as an alias of the earlier name.

## The repository

```
urban-wind-lab.html          the application (the deliverable)
README.md                    what it is, how to use and cite it, the licence
CITATION.cff                 citation metadata: version, date, concept and version DOIs
.zenodo.json                 the metadata Zenodo archives each release with
LICENSE                      MIT
docs/
  urban-wind-lab-method-notes.html          method notes (Elementor HTML widget)
  urban-wind-lab-method-notes-summary.html  the short companion, with exercise diagrams
  urban-wind-lab-technical-notes.md         the solver, units, boundaries and exercises in Markdown
tools/
  check-release-metadata.mjs                the release guard
ARCHITECTURE.md · CHANGELOG.md · DESIGN.md
```

`.zenodo.json` holds the metadata Zenodo uses for each archived release,
including the licence notes and how the app was developed. Zenodo reads it in
preference to `CITATION.cff`, so the guard checks that its version agrees.

## Testing and release

There is no automated test suite.
`node tools/check-release-metadata.mjs` is the release guard. It runs 18
checks that the version, the date and the DOI agree everywhere they are
written: `CITATION.cff`, `.zenodo.json`, the app's `VERSION` and `RELEASED`, the README's
stamp and citations, and each method-notes page's byline and BibTeX. Until
Zenodo mints a release's version DOI, the citations must carry the concept
DOI; the guard derives that rule from the identifier descriptions in
`CITATION.cff` ("Version DOI — X.Y.Z").

Release order: bump every stamp, run the guard, push, cut the GitHub
release (tag `vX.Y.Z`), then record the version DOI Zenodo mints in a
separate commit.
