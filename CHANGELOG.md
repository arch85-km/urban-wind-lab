# Changelog

Each release is archived on Zenodo with its own version DOI. The concept DOI,
[10.5281/zenodo.22797137](https://doi.org/10.5281/zenodo.22797137), always
resolves to the newest version. The full notes for each release are on the
[releases page](https://github.com/arch85-km/urban-wind-lab/releases).

## 1.1.0 — not yet released

The version is bumped to 1.1.0, dated 4 October 2026, on `main`. The GitHub
release has not been cut, so there is no version DOI yet.

- **Added** — the licence, the credits and the release are shown inside the
  app: the MIT and CC BY 4.0 terms and what they permit, what the app is
  built from, the version and date, and the citation. The panel reads the
  release from `VERSION` and `RELEASED`, so it cannot drift from the file.
- **Changed** — the browser tab shows the cube logo itself, carried in the
  file as 16 px and 32 px PNGs, instead of a simplified stand-in.
- **Changed** — the cube device, the icon and logo, is reserved: neither the
  MIT licence nor CC BY 4.0 grants any right to use it.
- **Fixed** — the README's citations named 1.1.0 but carried 1.0.1's version
  DOI. They now carry the concept DOI until 1.1.0's is minted.
- **Fixed** — the release guard read only unquoted DOI values in
  `CITATION.cff`, so it could not see a declared version DOI. It now reads
  both styles, and checks the app's release stamp, the README and every date
  as well: 18 checks.
- **Docs** — `ARCHITECTURE.md`, `CHANGELOG.md` and `DESIGN.md` added, and a
  statement of how the app is developed added to the README, the method notes
  and a new `.zenodo.json`, which also carries the licence notes to Zenodo.
- **Added** — a notice when the browser runs the solver without its compiler.
  Microsoft Edge's "Enhance your security on the web" (and Safari's Lockdown
  Mode) does this for sites it does not know, and the solver then runs about
  30 times slower: the field barely develops and a change of wind direction
  appears to do nothing. Recognised by timing plain script work against
  built-in work, so the computer's own speed cancels (Edge in that mode still
  provides WebAssembly, so checking for it missed the case). A message
  stays over the 3D view for as long as it lasts, until hidden: in Edge it
  gives the steps (the padlock, "Enhanced security is active for this site",
  turn it off, Refresh); in any other browser in that mode, to use Chrome or
  Firefox. A pop-up or the footer line was gone before anyone read it.
- **Fixed** — the downwind faces copied their interior neighbour, which held
  neither velocity nor pressure, so with buildings present the pressure level
  of the whole domain drifted for as long as the solve ran, and the wind at
  pedestrian level drifted with it: in the sample district the mean
  pedestrian speed rose 31% between steps 1500–2000 and 2500–3000, and the
  detailed preset threw speeds up to 7.7 times the reference. They are now a
  pressure outlet (Guo, Zheng and Shi 2002): the density is held at the
  datum, the velocity and the non-equilibrium part come from the neighbour.
  The level settles, the mean pedestrian speed holds within 1% from step 1000
  to 3000, and an isolated cube's face pressures are unchanged within 0.05.
- **Added** — "Rotate model", −180° to +180° in 5° steps, to set an imported
  model's north to true north. The scale comes from the model as drawn, so
  turning does not resize it; a model turned so far that it reaches past the
  domain is drawn smaller, and the footer and a message say so. The exported
  image's title records the turn and any scaling.
- **Changed** — the OBJ units, Y-up and fit switches act at once on the model
  already loaded. They were read only at import, and changing them afterwards
  did nothing, with nothing on screen to say so. The import message now points
  out a file that is plainly in the wrong units (594 km across in metres:
  millimetres) or stands on its edge (a Z-up site imported as Y-up).
- **Added** — Legend range › Custom: the colour field's scale typed per field,
  and the facade Cp scale, with a message when a pair is not low-to-high.
- **Fixed** — Lock held the colour field's scale but not the facades', and one
  range across all fields: locked on wind speed, Ux was drawn on 0–5 m/s, so
  every westward flow was the bottom colour. It now holds each field's range
  and the facade scale.
- **Changed** — Mean, 90th percentile and Peak apply at once to the sector last
  clicked; they used to wait for the next click on the rose. A line explains
  each, and each colour field now has a one-line explanation under its menu.
- **Fixed** — an OBJ face pointing at a missing vertex stayed in the triangle
  count and left a blank triangle at the origin, which stretched the model's
  bounds to it: a 20 m cube 500 km from the origin with one broken face came
  in as a flat 226 × 180 × 0 m sheet. Only the triangles written are kept now,
  and a file with no usable faces is refused, leaving the model on screen.
- **Changed** — "Fit model to site" is off by default, and the app now says
  whenever an imported model is not at the size its file gives: by how much it
  was scaled, and its length and height in the file and on the site. Fitting
  was on and silent, so a 12.6 × 23.1 × 18.4 m building was drawn 3.52 times
  larger, 65 m tall: the 1.5 m plane sat below its first step and the wind on
  it was a 65 m building's. A model too large for the domain is still shrunk
  to fit, and now says so with the figures. The two exercises that told
  students to turn fitting off now say to leave it off.
- **Docs** — the facade pressure legend and the method notes say that Cp
  shows the pattern and carries an offset: in the confined domain the air
  piles up ahead of the buildings, about +2 in the sample district. The
  method notes and the technical notes give the measurements before and
  after the outlet change, and cite Guo, Zheng and Shi.
- **Changed** — when the guided tour ends, by finishing, skipping or Escape,
  every group in the left panel folds to its heading, as in Solar Lab, rather
  than leaving the whole column of controls open. The results panel on the
  right is left as it is.
- **Added** — a facade pressure scale in the legend, shown while "Facade
  pressure (Cp)" is on: the diverging ramp with its Cp range, red where the
  wind presses on a facade and blue where it pulls. The facades were coloured
  with no scale to read them by.
- **Fixed** — the height of the horizontal section plane moved in steps of
  0.45 m (0.5% of the 90 m domain), from 1.35 m to 1.8 m, so it could never be
  set to the 1.5 m pedestrian level. It now moves in 0.1 m steps and catches
  at 1.5 m; only 1.5 m is labelled the pedestrian level.

## [1.0.1](https://github.com/arch85-km/urban-wind-lab/releases/tag/v1.0.1) — 2 October 2026

Version DOI [10.5281/zenodo.23108263](https://doi.org/10.5281/zenodo.23108263).
A maintenance release. No default, threshold or solver constant changed, so
any figure quoted from 1.0.0 still reproduces.

- **Fixed** — skipping the tour on a phone left a drawer covering the model.
  The tour now restores the drawers as it found them.
- **Fixed** — the roughness tooltip stated a profile the solver does not use
  (the undisplaced log law). It now matches the code and the method notes.
- **Fixed** — "Pedestrian level · 1.5 m" was a fixed heading. It now shows
  the height actually sampled: 1.88 m, 1.36 m or 1.07 m, depending on the
  resolution preset.
- **Docs** — why the m/s reading is exact arithmetic and still not a wind
  speed.
- **Docs** — why an amplification reading below 1.0 does not mean shelter.
- **Docs** — the benchmark data the tool has never been compared with is
  named, together with what stands between the tool and a scored
  comparison.

## [1.0.0](https://github.com/arch85-km/urban-wind-lab/releases/tag/v1.0.0) — 16 September 2026

Version DOI [10.5281/zenodo.22797138](https://doi.org/10.5281/zenodo.22797138).
First public release.

- A three-dimensional D3Q19 lattice-Boltzmann solve in a Web Worker, with a
  Smagorinsky sub-grid model and an atmospheric boundary layer log-law
  inlet.
- Wind speed, amplification, pressure coefficient and vertical velocity on
  section planes through any axis.
- Lawson pedestrian comfort classes on the pedestrian plane.
- OBJ import for your own geometry, and EPW import for local wind data.
- A captioned PNG export at screen or print resolution.
- Early-stage comparative analysis, not a substitute for validated CFD or
  wind-tunnel testing: the velocity ratios are meaningful, the absolute
  speeds are not validated.
