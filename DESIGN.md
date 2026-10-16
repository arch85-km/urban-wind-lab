# Design decisions

The decisions behind Urban Wind Lab, and my reasons for them.
[`ARCHITECTURE.md`](ARCHITECTURE.md) describes how the code is organised,
and the [method notes](docs/urban-wind-lab-method-notes.html) describe the
solver, every constant it uses and what it does not model. This file records
why the tool is the way it is. Written in October 2026, at version 1.1.0.

— Karam Al-Obaidi

## Why it exists

My students needed to test how their own massing changes the wind at street
level, and nothing they had let them do that:

- **IESVE** needs a licence and so runs only on lab PCs, and asks for a great
  deal of set-up before a first wind answer.
- **Rules of thumb**, diagrams and precedent explain the effects, but they
  cannot show what a student's own massing does.

There was nothing suitable that students could use on their own designs.

## Why it runs in the browser

- **Nothing to install.** No licence and no admin rights, on lab PCs or on
  students' own laptops.
- **Any device, and embeddable.** It runs on any machine with WebGL2, and sits
  inside my website.
- **Archivable.** One file is the whole tool, so each Zenodo record holds
  exactly what was taught with.

## Method

### A lattice-Boltzmann solver

The tool solves the flow in three dimensions with a D3Q19 lattice-Boltzmann
method rather than anything simpler.

- **Real 3D flow.** Downwash, corner acceleration and wakes are solved, not
  inferred from a 2D slice or a rule.
- **Fast enough to run live.** It runs interactively in a browser, so the
  field responds while students change the massing.
- **Simple and explainable.** The update rule is local and can be followed,
  and every constant can be set out in the method notes.
- **A bridge to professional CFD.** Students meet convergence, boundaries and
  resolution here before they meet professional tools.

### The wind speed rescales instead of re-solving

The field is solved once for a direction and a roughness, and a change of
wind speed rescales it at once.

- **An instant response.** Students see the effect of the speed straight away,
  which keeps a session moving.
- **The ratios are the result.** What the tool can stand behind is the ratio
  between two runs, not an absolute speed, and the design says so.

### Lawson comfort classes

The pedestrian plane is classified with the Lawson criteria.

- **UK practice.** They are the criteria UK planning authorities and
  consultants use.
- **The same as professional reports.** Students see the categories they will
  meet in wind reports on real schemes.
- **Easy to read.** Each threshold is tied to an activity (sitting, standing,
  walking) that students can relate to a design.

### A fixed domain with three resolution presets

The lattice always covers 240 m by 240 m, at one of three resolutions.

- **It keeps the solve live.** A small fixed lattice is what lets it run
  interactively in a browser.
- **Teaching scale.** A block or a small district is the scale students design
  at in the early stages.
- **Speed against detail.** The presets let students trade a quick look for a
  finer run, and see what the cell size costs.

## Teaching

I use the tool in undergraduate and postgraduate teaching.

**The three exercises** in the method notes are mine:

1. Downwash, and why podiums exist.
2. Channelling, and why alignment is everything.
3. Wake, sheltering, and the spacing that controls both.

Three changes came from watching students use the tool:

- **Phones.** Students used it on small screens, so in 1.0.1 the tour and the
  drawers were fixed so that nothing is left covering the model.
- **Misread numbers.** Students quoted the m/s reading as a wind speed, and
  read an amplification below 1.0 as shelter. The method notes now explain
  both.
- **The sampled height.** Students asked what "1.5 m" really meant, so the
  results panel now shows the height actually sampled.

## What it leaves out

- **Thermal effects.** The flow is neutral and isothermal: no buoyancy, no
  stack effect and no atmospheric stability.
- **Terrain.** The ground is a flat plane, with no slopes or surrounding
  topography.

## How a release is checked

Before I teach with a release:

- **The release guard passes**, so the version, the date and the DOI agree
  everywhere they are written.
- **I use the live site myself**, as a student would.
- **I work through the three exercises** and check that they still show what
  they should.

## Licensing and archiving

The code is MIT and the teaching material is CC BY 4.0:

- **The code is free to reuse.** Anyone can adapt or embed it.
- **The material is reusable with credit.** Other educators can use the notes
  and exercises in their own courses, crediting the source.
- **The cube mark is reserved from both**, so a modified copy cannot pass
  itself off as mine.
- **Open licensing is expected** of this kind of work by my university or
  funders.

Every version is archived on Zenodo with its own DOI:

- **Reproducible figures.** A reported number can be traced to the exact build
  that produced it.
- **A citable research output.** The software counts as an output in its own
  right.
- **A permanent archive.** Each version survives even if my website changes.
- **Credit when reused.** Anyone who uses it has a proper way to cite it.

## How this was developed

I designed the application. I defined the problem and the scope: what the tool
is for, who it is for and what it leaves out. I chose the methods and the
sources it relies on, and set the exercises. I tested it in use, found and
reported the bugs, judged whether each fix worked, and decided what was
released and when.

The code was written with an AI coding assistant, working to my specification
and direction. It wrote most of the code, drafted the documentation, which I
reviewed, diagnosed bugs and proposed fixes, which I then tested, and wrote and
ran the release checks. I retain full intellectual responsibility for the
design, the methods and the results, including any errors.

## Next

- **Trees and porous screens**, as porous blocks.
- **Wind-rose-weighted comfort**: several directions from an EPW combined into
  one annual comfort map.
- **A benchmark comparison**: a scored comparison against the AIJ cases the
  method notes name.
- **A larger or finer domain**, more room around the model or smaller cells,
  as browsers allow.
