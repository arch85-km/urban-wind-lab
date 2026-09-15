# Urban Wind Lab

Interactive lattice-Boltzmann wind analysis for a 3D urban context, built for teaching
architecture students. One self-contained HTML file: no build step, no dependencies, no
network requests. Open it in a browser and it solves.

**[Open the tool](https://karam.me.uk/applications/urban-wind-lab/)** ·
**[Method notes](docs/urban-wind-lab-method-notes-elementor.html)**

## What it does

A genuine three-dimensional D3Q19 lattice-Boltzmann solve runs in a Web Worker while you
orbit the model. Change the wind and the field responds; change the massing and you can see
why the wind changed.

- **Wind** — speed 0.5–30 m/s at 10 m, any direction on a 16-point dial, four terrain
  roughness classes driving a logarithmic atmospheric boundary layer inlet.
- **Fields** — speed, the signed Ux / Uy / Uz components, pressure coefficient, and
  amplification against the 10 m reference, each on its own legend with an optional lock so
  two schemes can be compared on one scale.
- **Reading the flow** — section planes on X, Y and Z, GPU streamline tracers, facade
  pressure, point probes, and a Lawson comfort layer over the pedestrian plane.
- **Your own geometry** — OBJ import in five unit systems, voxelised onto the lattice.
- **Real weather** — EPW import builds a 16-sector wind rose from all 8,760 hourly records;
  click a sector to drive the solve from it at its mean, 90th-percentile or peak speed.

## Using it

Download `urban-wind-lab.html` and open it. That is the whole installation.

To embed it in a page, either serve the file and point an `<iframe>` at it, or paste the
file's contents into a WordPress **Custom HTML** block — everything is scoped under
`#ucfd-root`, so it cannot reach the rest of a theme. It is responsive down to phone width
and follows a light or dark presentation mode.

Requires a browser with WebGL2.

## What it is not

A teaching and early-concept instrument, not an assessment tool. The velocities are
qualitative: compare two runs at identical settings and quote the ratio, rather than quoting
a speed in m/s as a prediction. The tool is unvalidated — no wind-tunnel comparison, no
benchmark case, no grid-independence study — and it should never appear as evidence in a
planning submission or a certified comfort assessment.

The [method notes](docs/urban-wind-lab-method-notes-elementor.html) set out exactly what
the solver does, every constant it uses, what it does not model, and where its numbers come
from. They are deliberately blunt about the limits, and they are the thing to read before
citing any figure.

## Repository

| Path | |
|---|---|
| `urban-wind-lab.html` | The application. This is the deliverable. |
| `docs/urban-wind-lab-method-notes-elementor.html` | Method notes, styled for an Elementor HTML widget |
| `docs/urban-wind-lab-technical-notes.md` | The same material in Markdown |

## Citing it

> Al-Obaidi, K. M. (2026). *Urban Wind Lab: An interactive lattice-Boltzmann tool for wind
> analysis* (Version 1.0.0) [Computer software].
> https://karam.me.uk/applications/urban-wind-lab/

```bibtex
@software{alobaidi2026urbanwindlab,
  author  = {Al-Obaidi, Karam M.},
  title   = {Urban Wind Lab: An interactive lattice-Boltzmann tool
             for wind analysis},
  year    = {2026},
  version = {1.0.0},
  url     = {https://karam.me.uk/applications/urban-wind-lab/},
  note    = {MIT licensed}
}
```

Report the wind direction, the terrain roughness, the resolution preset and the sampled
height the panel shows alongside any figure taken from the tool. All four change the numbers.

## Licence

The application — `urban-wind-lab.html` in its entirety, including the explanatory text
embedded in it — is released under the **MIT Licence** (see [`LICENSE`](LICENSE)).

Accompanying material published separately — documentation pages, exercises, handouts, slides
and screenshots — is released under **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.
Suggested credit: *Urban Wind Lab by Karam Al-Obaidi, CC BY 4.0*.

Two things neither grant can reach: a screenshot showing an imported OBJ model, or a wind rose
built from someone else's EPW, contains material the author does not own and cannot
relicense; and EPW weather files carry the terms of whoever published them.

The application bundles no third-party code.

© Karam Al-Obaidi
