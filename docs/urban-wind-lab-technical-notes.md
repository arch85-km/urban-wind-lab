# Urban Wind Lab — technical notes for the documentation page

**Version 1.0.0 · 15 September 2026**

Everything below is read out of `urban-wind-lab.html` as it currently stands, not from
general knowledge of lattice-Boltzmann methods. Where the code does not settle a question,
that is said explicitly rather than filled in.

**The one-line answer for students:** treat the output as a *qualitative* picture of flow
behaviour. The velocity ratios are meaningful in relative terms; the absolute velocities are
not validated, and the domain is too small for boundary-independent results. Reasons below.

---

## 1. The solver

| Property | Value in the code |
|---|---|
| Lattice | **D3Q19** — 19 velocities, three dimensions |
| Collision | **BGK**, single relaxation time |
| Turbulence | **Smagorinsky** sub-grid model, `C = 0.14` |
| Base relaxation time | `τ₀ = 0.51` |
| Reference lattice velocity | `u_ref = 0.045` (at the 10 m reference height) |
| Precision | `Float32Array` distributions, `Float64` scratch per cell |
| Execution | Web Worker, non-blocking |

**Genuinely 3D.** The velocity set spans all three axes (`EZ` is non-zero for eight of the
nineteen directions) and the lattice is `nx × ny × nz`. It is not a 2D slice, and vertical
motion — downwash, updraught — is solved, not inferred.

**Viscosity.** Standard LBM relation, `ν = (τ − ½)/3` in lattice units, giving
`ν_lat = 0.00333` at `τ₀ = 0.51`. Smagorinsky then raises `τ` locally from the second moment
of the non-equilibrium distribution (the Hou et al. formulation):

```
τ = ½( τ₀ + √( τ₀² + 18√2 · C² · |Π| / ρ ) )
```

so eddy viscosity appears where the flow is sheared. `τ` is clamped to 1.6 as a stability
guard.

**The Reynolds number is not the physical one, and this is the single most important caveat.**
Worked for the sample district's 24 m tower at the default 8 m/s, Balanced lattice:

- Physically: `U ≈ 11.7 m/s` at mid-height, `L = 24 m`, `ν_air = 1.5×10⁻⁵` → **Re ≈ 1.9×10⁷**
- In the simulation: `u_lat ≈ 0.066`, `L = 8.8 cells`, `ν_lat = 0.00333` → **Re ≈ 1.7×10²**

Five orders of magnitude apart, and the Smagorinsky term lowers the effective figure further.
The solve is not resolving the real Reynolds number; it relies on the fact that separation from
**sharp edges** is fixed by geometry rather than by Re. That assumption is reasonable for
rectilinear massing and fails for curved or streamlined forms (see §8).

**Convergence.** A residual is computed at every reporting interval — the mean absolute change
in cell speed between reports, normalised by mean speed — and displayed. A "Steady state" badge
appears when `step > 260` **and** `residual < 0.0022`. Note what this is *not*: **the solve never
stops.** There is no termination criterion, no fixed iteration count, and nothing prevents a
student reading results at step 20. There is a divergence guard that halts and reports if density
leaves `0.2 < ρ < 5`.

---

## 2. Units and scaling

The domain is **fixed at 240 × 240 × 90 m** (`SITE = 240`, `DOMAIN_H = 90`). Only the cell count
changes between presets:

| Preset | Cells | Δx | Domain height | Δt at 8 m/s |
|---|---|---|---|---|
| Fast | 64 × 64 × 24 = 98,304 | 3.75 m | 90 m | 0.0211 s |
| **Balanced (default)** | 88 × 88 × 33 = 255,552 | **2.73 m** | 90 m | **0.0153 s** |
| Detailed | 112 × 112 × 42 = 526,848 | 2.14 m | 90 m | 0.0121 s |

**Mapping.** Length: `Δx = 240 / n` metres per cell. Velocity: the inlet is always `u_ref = 0.045`
in lattice units at 10 m, whatever the physical speed. Time: `Δt = Δx · u_ref / U₁₀` seconds
per step. Mach number `u_ref√3 = 0.078`, so weak-compressibility error is O(Ma²) ≈ 0.6%.

**Changing the wind speed does not re-solve, by design.** The stored field is normalised —
velocity as `U/U₁₀`, pressure as `Cp` — and the reference speed is applied on display. This is the
Reynolds-independence assumption again: the flow *pattern* is taken as fixed and only magnitudes
scale. Changing **direction** or **terrain roughness** does start a new solve.

**What a student can change:** lattice resolution only. The domain size, `u_ref`, `τ₀` and the
Smagorinsky constant are not exposed. Raising the resolution improves feature resolution and
lowers numerical diffusion; it does not change the domain-size problem in §3.

---

## 3. Boundary conditions

| Boundary | Condition in the code |
|---|---|
| Upwind faces | Equilibrium at a **logarithmic ABL profile** |
| Downwind faces | Zero gradient (copy of the interior neighbour) |
| Domain top | **Driven free stream** — equilibrium at the same log profile |
| Ground | Half-way bounce-back (no-slip) |
| Buildings | Half-way bounce-back on voxelised solids |

**Inlet.** Logarithmic, not uniform and not a power law:

```
U(z) = U₁₀ · ln((z + z₀)/z₀) / ln((10 + z₀)/z₀)
```

with `z₀` selectable as 0.03 / 0.3 / 1.0 / 2.0 m. The `+z₀` offset avoids the singularity at the
wall. The inlet is applied per cell to **whichever faces face upwind** (`n·w > 0`), so any azimuth
works without rotating the model — but it means the lateral faces are not symmetry planes: each
face is either an inlet or a zero-gradient outlet.

**Two things worth stating plainly:**

- The top is **not** free-slip or symmetry. It is a Dirichlet condition forcing the undisturbed
  profile, only 26 m above the tallest sample building. That suppresses the vertical displacement
  of flow over the district and will accelerate flow through the gap.
- **`z₀` shapes the inlet profile only.** The ground itself is plain no-slip bounce-back with no
  wall function and no roughness. Selecting "Dense city centre" changes what enters the domain,
  not the surface drag inside it.

**Is the domain big enough? No — and this is the second major caveat.** Measured for the built-in
sample district (184.7 × 207.4 × 64 m):

| Best-practice guideline (COST 732 / Franke et al.) | Required | Actual |
|---|---|---|
| Clearance above the tallest building | ≥ 5H = 320 m | **26 m (0.41H)** |
| Lateral clearance | ≥ 5H | **17.7 m in X; −0.2 m in Y** |
| Blockage ratio | < 3% | **≈ 40%** |

The negative Y figure is not a typo: the sample district's northern slab reaches the domain
boundary. Boundaries **do** influence the flow near the buildings here. The confinement will tend
to over-accelerate flow over roofs and through gaps, because the displaced air has nowhere else to
go. This is a deliberate trade for interactive speed in a browser, but it should be stated on the
documentation page, not glossed.

---

## 4. What is computed and shown

Solved per cell: the three velocity components and density. Everything else is derived.

| Output | Definition in the code |
|---|---|
| Wind speed \|U\| | `√(u²+v²+w²)`, in m/s after scaling by `U₁₀` |
| Ux, Uy, Uz | Individual components, signed — Uz is the updraught/downwash indicator |
| Pressure coefficient Cp | `2(ρ_lat − 1) / (3 u_ref²)` |
| Amplification factor | `\|U\| / U₁₀` |
| Lawson comfort class | Categorical, from the local mean speed |
| Streamline tracers | GPU particles advected through the velocity field |
| Facade pressure | Building surfaces coloured by Cp sampled one cell outside the surface |
| Probes | Point readout: speed, ratio, components, Cp, comfort class |

**There is no vorticity output** — the string does not occur in the file. No turbulence intensity,
no TKE, no age-of-air, no pollutant transport.

**Cp reference.** Referenced to the lattice datum `ρ = 1`, which is the density imposed at the
inlet, so it is approximately referenced to the undisturbed inflow rather than to a measured
free-stream static pressure at a stated point.

**Amplification** is against the **10 m reference speed**, not the undisturbed speed at the same
height. That is the usual convention in wind-comfort work, but it must be stated, because a value
of 0.8 at pedestrian level does not mean "sheltered" — the undisturbed profile at 1.4 m is already
only about 0.36 × U₁₀ for `z₀ = 1 m`.

**Comfort criteria: Lawson LDDC thresholds only.** No NEN 8100, no Davenport. Bands as coded:
frequent sitting < 2.5, occasional sitting < 4, standing < 6, strolling < 8, business walking < 10,
uncomfortable < 15, unsafe ≥ 15 m/s. "Calm area" is a separate statistic: fraction below an
absolute 1.5 m/s.

**How the criteria are evaluated is a simplification students must not misreport.** Real Lawson
classification uses a *gust-equivalent mean* speed and asks whether a threshold is exceeded more
than a stated percentage of the year, summed over every wind direction weighted by its annual
frequency. This tool applies the thresholds to the solved **mean** speed for **one direction at a
time**, with no gust factor and no exceedance statistics. The categories are therefore indicative
labels, not a Lawson assessment.

**Sampling height — a discrepancy to be aware of.** The comfort plane is *drawn* at exactly
z = 1.5 m, but the statistics are sampled from the nearest cell centre, which is
`round(1.5/Δx − 0.5)`. On every preset that resolves to layer 0, whose centre is:

| Preset | Sampled height |
|---|---|
| Fast | **1.88 m** |
| Balanced | **1.36 m** |
| Detailed | **1.07 m** |

So the reported "pedestrian level · 1.5 m" figures are actually taken between 1.07 m and 1.88 m
depending on the resolution chosen, and the number changes when a student switches preset. The
panel does display the true sampled height. Worth stating, or worth fixing.

**Statistics area.** Mean, max, amplification, calm fraction and the Lawson distribution are
computed over the *area of interest* — the model bounding box plus 30 m, clamped to the domain —
not the whole domain, so the open buffer does not dilute the numbers.

---

## 5. What is not modelled

- **Thermal effects entirely.** The solve is isothermal: no buoyancy, no stack effect, no solar
  gain, no stratification, no stable/unstable atmospheric conditions. Only neutral conditions.
- **Vegetation and porosity.** No trees, no hedges, no porous screens, no permeable facades.
  Every solid is a perfect no-slip block.
- **Terrain.** The ground is a flat plane at z = 0. No slopes, no embankments, no surrounding
  topography. `z₀` affects only the inlet profile, not the ground surface.
- **Wind direction variability.** **One direction at a time.** There is no multi-direction run
  and no wind-rose weighting of results.
- **Climate statistics.** An EPW import builds a 16-sector wind rose from all 8,760 hourly
  records, and clicking a sector loads that sector's mean, 90th-percentile or peak speed into the
  solver — but the *solve itself* uses that single speed and direction. The annual frequencies are
  displayed, never applied to the results.
- **Also absent, and commonly assumed present:** moisture, rain, driving-rain assessment; snow
  drifting; pollutant dispersion; noise; roof-level wind for equipment; unsteady/transient
  statistics (the tool reports an instantaneous field, not a time-averaged one with peaks);
  surrounding city context beyond what is imported; and any form of validation.

---

## 6. Resolution and accuracy

**Cell size 2.14–3.75 m.** Practical consequences:

- The smallest resolvable feature is one cell. A 1 m balcony, a canopy, a parapet, a railing or a
  colonnade simply does not exist in the solve.
- Best practice for pedestrian wind comfort is around **10 cells across the smallest building
  dimension**. At Balanced, a 24 m tower is 8.8 cells — marginal — and anything under ~27 m is
  under-resolved.
- Geometry is **voxelised** (surface pass plus parity fill), so all surfaces are staircased.
  Diagonal and curved facades become steps, which changes where flow separates on non-rectilinear
  forms.
- Bounce-back places the wall halfway between cells; there is no wall function, so near-wall
  velocity gradients are resolved by whatever the lattice provides — which at these cell sizes is
  very little.

**Approximations made for browser performance, and their cost:**

| Approximation | Cost |
|---|---|
| Small fixed domain (§3) | Boundary interference near buildings; over-acceleration over roofs |
| Coarse lattice | Sub-cell detail lost; separation points approximate |
| BGK rather than MRT | Less stable and more dissipative at low `τ` |
| Smagorinsky, no wall damping | Eddy viscosity does not vanish correctly at walls; near-wall shear over-damped |
| Single-direction, mean-flow | No gust, no exceedance, no directional weighting |
| Reynolds-independence for speed changes | Fine for sharp edges, wrong for curved bodies |

**Qualitative or quantitative?** **Qualitative.** The tool reliably shows *where* flow accelerates,
separates, recirculates and stagnates, and *how those patterns change* when massing changes. That
is what it is for. A specific velocity at a specific point should not be quoted as a predicted
wind speed: it carries the domain-confinement bias, coarse-lattice error, staircased geometry, an
unvalidated Reynolds regime and an instantaneous rather than time-averaged sample. **Comparisons**
between two schemes run at identical settings are far more trustworthy than any single absolute
number — that is the honest use of it, and the Lock button on the legend exists to support exactly
that comparison.

---

## 7. Inputs the user controls

| Control | Range | Units | Default |
|---|---|---|---|
| Reference wind speed | 0.5 – 30 | m/s at 10 m | **8** |
| Wind direction | 0 – 359 (dial, 16-point snap) | degrees, meteorological (*from*) | **250 (WSW)** |
| Terrain roughness `z₀` | 0.03 / 0.3 / 1.0 / 2.0 | m | **1.0 (urban)** |
| Lattice resolution | Fast / Balanced / Detailed | — | **Balanced** |
| Colour field | speed, Ux, Uy, Uz, Cp, amplification | — | speed |
| Section planes X / Y / Z | 0 – 1 across the area of interest | normalised | Z on, at 1.5 m |
| Legend range | Auto / Lock | — | Auto |
| Lawson comfort layer | on / off | — | off |
| Streamline tracers | on / off | — | on |
| Tracer density | 8k / 20k / 40k / 80k / 150k | particles | 40k |
| Facade pressure | on / off | — | off |
| Ground grid | on / off | — | on |
| Scenario presets | Breeze 4 / Prevailing 8 / Storm 18 m/s | m/s | Prevailing |
| Solver | Pause / Step ×20 / Reset | — | running |
| OBJ import | units m/mm/cm/ft/in, Y-up toggle, fit-to-site toggle | — | m, Y-up, fit on |
| EPW import | 16-sector rose; apply mean / 90th percentile / peak | — | mean |

Not exposed: domain size, `τ₀`, the Smagorinsky constant, `u_ref`, the reporting interval, the
convergence threshold.

---

## 8. How it compares to established tools

**Where it would agree with OpenFOAM, Fluent or a wind tunnel**

- The *topology* of the flow: stagnation on windward faces, separation at sharp edges, corner
  acceleration, recirculating wakes, downwash on tall windward facades, channelling in aligned
  streets.
- The *ranking* of design options — which of two massing arrangements produces a windier plaza —
  provided both are run at identical settings.
- Broad velocity-ratio patterns at pedestrian level: which areas are relatively fast or sheltered.

**Where it would diverge**

- **Absolute velocities**, because of domain confinement (≈ 40% blockage against a < 3% guideline),
  coarse cells and no wall treatment.
- **Anything curved or streamlined.** Staircasing plus an unphysical Reynolds number means
  separation on a cylindrical or faceted tower will be wrong in both location and strength.
- **Reattachment lengths and wake extent**, which are sensitive to both Re and turbulence
  modelling.
- **Near-ground values**, where a real study uses a rough-wall function and this uses plain
  bounce-back.
- **Anything requiring gusts or statistics** — peak gusts, exceedance probabilities, annual
  distributions — none of which is computed.
- **Thermally driven flow**, entirely absent.

**Planning submission or BREEAM?** **No — strictly indicative.** A BREEAM Wat/HEA-type wind
assessment or a planning-authority microclimate study expects a validated solver, a domain sized to
COST 732 / AIJ guidance, grid-independence testing, a rough-wall treatment, all wind directions
weighted by local climate statistics, gust-equivalent Lawson or NEN 8100 classification with
exceedance percentages, and usually wind-tunnel corroboration for tall buildings. This tool
provides none of those. It is a teaching and early-concept instrument: it shows students *why* a
massing decision changes the wind, and it flags where a real study will be needed. It should never
appear as evidence in a submission.

---

## Three exercises

Each teaches one principle, states exactly what to build and what to read, and takes ten to twenty
minutes. All three are comparative by design, which is where the tool is trustworthy.

### Exercise 1 — Downwash, and why podiums exist

**Build two OBJ models,** identical except for the podium.

- *Scheme A:* a single slab, 40 m wide × 20 m deep × 60 m tall, standing alone on the site.
- *Scheme B:* the same slab, plus a podium 4 storeys / 14 m tall extending **10 m forward** of the
  windward face, the full 40 m width.

**Settings:** wind 10 m/s, direction normal to the wide face, `z₀` = 1.0 m, Balanced, legend
**Locked** to the same range for both runs.

**Read:** the Z section plane at 1.5 m, and the **Uz** colour field on a Y section cut through the
slab centreline. Pin a probe 5 m in front of the windward face at ground level in each scheme.

**Expect:** in Scheme A, strongly negative Uz down the windward face — high-momentum air from
40–60 m being driven to the ground — and a fast, uncomfortable strip at the base. In Scheme B the
podium intercepts that descending flow and pushes the acceleration onto the podium roof instead.
Ask students to quantify the change in the probe's amplification factor, and to explain why the
podium depth matters more than its height.

### Exercise 2 — Channelling, and why alignment is everything

**Use the built-in sample district** — no import needed. It has a continuous east–west street.

**Run three directions** at 8 m/s, `z₀` = 1.0 m, Balanced, legend **Locked** across all three:
**270° (aligned with the street)**, **315° (45° oblique)**, **360° (across the street)**.

**Read:** the Lawson comfort layer plus the pedestrian-level statistics panel each time. Record
mean speed, max speed and the percentage of area in each comfort band.

**Expect:** the aligned case produces a clear high-velocity ribbon along the canyon — channelling,
driven by the pressure gradient along an unobstructed street. The oblique case largely destroys it,
replacing it with discrete corner jets at each block end. The cross case leaves the street
sheltered but accelerates the gaps between blocks. The teaching point: channelling is not a
property of the street, it is a property of the street *and* the wind rose together — which is why
a real assessment weights every direction by frequency, and why this tool cannot do that for them.

### Exercise 3 — Wake, sheltering, and the three flow regimes

**Build three OBJ models,** each two identical blocks 40 m wide × 20 m deep × **20 m tall**, aligned
with the wind, differing only in the gap between them:

- *Case 1:* gap 20 m (**S/H = 1**)
- *Case 2:* gap 40 m (**S/H = 2**)
- *Case 3:* gap 80 m (**S/H = 4**)

**Settings:** wind 8 m/s normal to the blocks, `z₀` = 1.0 m, Balanced, legend **Locked**, tracers on.

**Read:** a Y section plane through the centreline with the **speed** field, plus the calm-area
percentage from the statistics panel.

**Expect** the three classical regimes: at S/H = 1 the flow skims across the tops and the gap holds
a single slow recirculation — *skimming flow*, a sheltered but poorly ventilated courtyard; at
S/H = 2 the shear layer begins to dip into the gap — *wake interference*; at S/H = 4 the flow
reattaches to the ground before the second block, which then sees almost undisturbed wind —
*isolated roughness*. Have students identify the transition and connect it to a real design
decision: shelter and ventilation are in tension, and courtyard proportion is the control.

**Caveat to give students with all three:** compare, do not quote. The velocity *ratios* between
two runs are the finding; the absolute m/s values carry every limitation in §6.
