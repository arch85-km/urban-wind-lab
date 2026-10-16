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
  statement of how the app is developed added to the README and the method
  notes.

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
