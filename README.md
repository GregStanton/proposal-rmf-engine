# RMF Engine for creative coding: <br /> High-fidelity sweep geometries and rails

**Status:** Stage 0 (Strawman)—*Proof of concept in development*  
**Author:** Greg Stanton  
**Proof-of-concept target:** December 12, 2025

We propose a high-fidelity _RMF Engine_ designed to be a geometric core for a broad expanse of creative-coding features, ranging from expressive geometries to choreographed motions. To illustrate the unifying force of the underlying rotation minimizing frames, we present an intuitive and highly expressive API layered atop this core.

We use a state-of-the-art technique (_double reflection_) to eliminate the twist distortions inherent to standard approaches. This provides an artifact-free implementation of versatile sweep geometries, including ribbons, tubes, and brushes.

Crucially, solving twist distortions necessitates a robust arc-length reparameterization system. We implement a pre-computed look-up table (LUT) with Newton-Raphson refinement to achieve high precision at real-time frame rates. This decouples geometry from timing, providing a composable system that allows cameras and objects to smoothly traverse complex rails at exact, prescribed speeds.

# Problem

Sweep geometries are extremely useful in computer graphics. They sweep a 2D shape (a _profile_ or _cross section_) across a 3D-space curve (_spine_, _backbone_, or _rail_). This essential feature is available in a wide range of graphics software (including [three.js](https://threejs.org/docs/#ExtrudeGeometry), [Blender](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/curve/operations/curve_to_mesh.html), [Houdini](https://www.sidefx.com/docs/houdini/nodes/sop/sweep.html#:~:text=18.0-,Overview,parameter%20on%20the%20Construction%20tab.), [Maya](https://help.autodesk.com/view/MAYAUL/2024/ENU/?guid=GUID-04C6192A-1524-48FA-B5BC-7745FC25D26D), and [Autocad](https://help.autodesk.com/view/ACD/2025/ENU/?guid=GUID-2391CE97-3794-402C-8BC1-E2DCB452DD13)). 

Essential use cases include ribbons, tubes, and brushes. A _ribbon_ is a surface that results from sweeping an open profile curve across the spine curve. These can be made to look like physical ribbons. A _tube_ is a surface or solid that results from sweeping a closed curve across the spine curve. These can be made to look like the tube in a neon sign. A _brush_ is a 2D profile that may be a set of discrete points or a mixture of different shape kinds. By setting a fixed orientation, a calligraphy brush may be created. In all cases, the profile may be scaled or rotated as it’s swept out, creating dynamic and twisting shapes.

However, these features are subject to well known pain points for users: 

* **singularity flipping** (this can occur in Frenet-Serret implementations where the frame suddenly flips 180° due to vanishing curvature)  
* **reference twisting** (this can occur in look-at/fixed-up implementations when the frame suddenly twists due to a vanishing cross product, analogous to gimbal lock)   
* **angular drifting** (this can occur even with rotation minimizing frames, unless a correction is applied, with the most noticeable effect being a sudden twist when a frame returns to its starting point on a loop)
* **texture stretching** (this can occur in Bézier curves or Catmull-Rom splines, where textures stretch or compress unevenly due to a parameter that doesn't match distance along the curve)

In creative-coding libraries using a `beginShape()`/`endShape()` API—including p5.js, Processing, and openFrameworks—no dedicated feature for sweep geometries exists at all. This significantly reduces the API’s artistic expressiveness.

# Solution

We present a solution that enriches the fundamental concept of a stroke, expanding it into an intuitive, expressive system for creating dynamic and textured lines in 2D, as well as ribbons, tubes, and rails in 3D.

## API

The revised `beginShape()`/`endShape()` API introduced in p5.js 2.0 is extremely intuitive and extensible. The implementation overhaul also introduced a new `p5.Shape` class (this class has not yet been exposed to the user, but this is planned, once the class is sufficiently stable). 

We will discuss how this API may be extended to sweep geometries. The solution described here leverages the new p5 API to make the creation of these flexible geometries incredibly natural.

A basic example of the API is indicated in the snippet below. 

```js
beginShape(SWEEP);

// profile
sweepSlice(slice);

// spine
vertex(x1, y1);
vertex(x2, y2);

endShape();
```

### General usage

Extend the shape `kind` parameter of `beginShape()` to support a single new value: `SWEEP`. This kind works with all path primitives (polylines via `vertex()`, Bézier curves via `bezierVertex()`, and interpolating splines via `spline()`).

### Profile definition

Provide a `sweepSlice(slice)` setter, where `slice` may be any 2D `p5.Shape` object, or an object literal specifying a primitive shape directly (e.g., `{shape: circle, x: 0, y: 0, radius: 1}`). The default slice is the unit circle centered at the origin.

* **Attachment:** The coordinate system of the 2D profile shape is mapped directly to the coordinate system of the spine’s local normal plane, with the origin of the profile plane placed exactly at the spine vertex.  
* **Offsetting:** This allows for implicit offsetting. For example, if a user defines a profile circle centered at $(10, 0)$, the resulting tube will float $10$ units away from the spine path.

### 2D sweep geometries

Support the `SWEEP` kind in 2D sketches. Typically, this means a line segment is swept across a 2D spine.

* **Calligraphy brushes:** Creating a calligraphy brush is as easy as setting an orientation.
* **Undulating strokes:** Creating a stroke with a dynamic, precisely tuned weight is as easy as scaling slices.

All this is consistent with the 3D case. We just construct in 3D and project to 2D. Specifically, the sweep geometry is constructed in 3D by embedding the profile's local xy-plane into the spine's normal-binormal plane. Then it's projected onto the 2D canvas, creating the same visual as a distant 3D camera would.

### Orientation settings

To resolve the conflict between organic forms and architectural forms, we introduce `sweepMode(mode)`. To achieve calligraphic effects, we introduce `sweepOrientation(orientation)`.

* **`sweepMode(FREE)` (Default):** This mode minimizes twist and prevents visual glitches (e.g. singularity flipping).
* **`sweepMode(FIXED, [reference])`:** This mode enforces a consistent "up" direction (`reference`) and prevents undesirable banking (e.g. on a road). The API pattern is similar to p5's `colorMode(mode, [max])`.
* **`sweepOrientation(orientation)`:** This mode sets a global orientation vector for all slice planes, allowing for calligraphic effects.

Specialized or advanced libraries could extend this API with the inclusion of `sweepSliceOrientation(orientation)`, which could be set at the level of individual spine vertices, similar to `normal()` in p5.js.

### Geometric attributes

Here, a _vertex attribute_ is an attribute that may be applied at the level of individual vertices, or globally, by allowing an attribute applied to one vertex to fall through to subsequent vertices.

* **Size:** The `sweepSliceFactor(factor)` vertex attribute sets the scale factor of the profile relative to its original size.
* **Angle:** The `sweepSliceAngle(angle)` vertex attribute sets the angle of the profile relative to the normal direction. It treats angle values as absolute linear `Number` values rather than cyclic values. This allows for multi-turn twists (e.g., 0 to $4\pi$). To create a seamless twisted loop, the user specifies the start angle (e.g., 0) and the end angle (e.g., $2\pi$) manually.

### Stroke attributes

* The `strokeWeight()` vertex attribute resizes the profile so the maximum dimension of its bounding box matches the provided weight. It’s an absolute resizing function, to complement `sweepSliceFactor(factor)`.
* The `strokeJoin()` vertex attribute supports the exact same options that are currently available for paths in the p5.js API.  
* The `strokeCap()` attribute also supports the same options that are currently available. In the case of a round cap, a rotational sweep is performed. The `ROUND` option is the same as `HORIZONTAL_ROUND`, which rotates over a horizontal axis. The other option is `VERTICAL_ROUND`.

### Closure

Calling `endShape(CLOSE)` ensures that the rotation angle of the start and end is equal, making it easy for users to untwist an intentionally twisted geometry, or to make sure that the orientation of the start and end profiles match.

### Discrete geometry (brushes)

The sweep logic supports arbitrary 2D geometry, not just continuous paths. If `beginContour()` is updated to accept shape kinds, this logic can treat disjoint sub-shapes or isolated points as individual elements. This effectively functions as a custom brush that stamps geometry along the path. In technical terms, this supports instancing or scatter effects (e.g., creating parallel lines or particle streams).

### UV mapping
Texture mapping follows the standard “soup can” convention: the sweep geometry is the can and the texture is the label.

* **$u$ (Profile):** Maps to the latitudinal direction of the profile perimeter.  
* **$v$ (Spine):** Maps to the longitudinal direction of the spine curve.

## Implementation

Here, we outline high-level aspects of an artifact-free implementation.

### Sweeping without flipping or twisting

To solve the distortions inherent to the Frenet-Serret and fixed-up approaches, we can default to rotation minimizing frames, computed with a state-of-the-art method known as *double reflection*. Compared to previous methods, this technique improves accuracy, simplicity, and speed. More precisely, *it offers* $\mathcal{O}(h^4)$ *accuracy*, compared to the standard $\mathcal{O}(h^2)$, ensuring stability even with fewer samples.

The technique was introduced by Wang, Jüttler, Zheng, and Liu (2008), researchers at the University of Hong Kong and Johannes Kepler University, in the paper "Computation of Rotation Minimizing Frames." A recent overview of related techniques may be found in "Balancing Rotation Minimizing Frames with Additional Objectives" by Mossman, Bartels, and Samavati (2023), representing research from the University of Calgary and the University of Waterloo.

### Caps

Standard stroke caps can be extended in a natural way to general 3D sweep geometries. 

* A *square* cap simply seals the open ends of the shape where the path stops.   
* A *projecting* cap extends the shape straight outward by the profile curve’s radius before sealing it.   
* A *round* cap rotates the profile halfway around the end.

### Joins

We can also extend the stroke joins of flat lines to general 3D sweep geometries. 

* A *mitered* join scales the profile in the bisector plane.   
* A *beveled* join linearly interpolates the gap.   
* A *rounded* join sweeps the profile rotationally between the segment ends.

### Angular-drift correction and faithful textures

The most obtrusive artifact of angular drift occurs in closed loops, which present a specific geometric challenge known as *holonomy*: the final RMF frame $U_{end}$ often arrives with a rotational offset relative to the starting frame $U_{start}$. This results in a visible seam or "snap" where the geometry connects.

While standard implementations often correct this by distributing the error linearly across the parameter $t$, this approach causes visual artifacts (uneven twisting) when control points are not equidistant (Blender Foundation, 2025).

Following the variational principles established by Wang et al. (2008), we implement a *Minimal Total Squared Angular Speed* correction. This requires distributing the angular error proportional to the *arc length* of the curve, not the parameter $t$.

This necessitates the existence of an *Arc-Length Parameterization System* within the core geometry engine. The same system would also offer a solution to the texture-stretching problem. A 2002 review of techniques (Wang et al.) suggests a Look-Up Table (LUT) approach.

**Cohesive architecture:** While the original motivation for the Arc-Length Parameterization System is to ensure seamless geometric continuity and faithful textures, the performant LUT approach also opens the door to exciting capabilities in motion choreography (see Appendix).

# Proof of concept

The code in this repository is meant to validate the performance and stability of the RMF algorithm before proposing a merge into p5.js or other software. To isolate the mathematical core from any framework overhead, I have chosen to implement the engine in a standalone, raw WebGL environment.

# WebGL2 and GLSL primer

For anyone who'd like to get up to speed in order to understand the implementation, I've written a [primer](https://github.com/GregStanton/webgl2-glsl-primer), starting from scratch with WebGL2 and GLSL fundamentals.

# References

Blender Foundation. (2025). *Blender 4.3 Reference Manual: Curve Shape*. Retrieved from [https://docs.blender.org/manual/en/latest/modeling/curves/properties/shape.html](https://docs.blender.org/manual/en/latest/modeling/curves/properties/shape.html)

Mossman, C., Bartels, R. H., & Samavati, F. F. (2023). Balancing rotation minimizing frames with additional objectives. *Computer Graphics Forum*, *42*(7), e14979.

Wang, H., Kearney, J., & Atkinson, K. (2002, June). Arc-length parameterized spline curves for real-time simulation. In Proc. 5th International Conference on Curves and Surfaces (Vol. 387396).

Wang, W., Jüttler, B., Zheng, D., & Liu, Y. (2008). Computation of rotation minimizing frames. *ACM Transactions on Graphics (TOG)*, *27*(1), 1-18.

# Appendix: Opening the door to customizable motion

While the primary focus of this proposal is static geometry generation, the underlying Rotation Minimizing Frame (RMF) system also serves as a powerful engine for motion and animation.

## 1\. The problem of parameterization

Standard spline implementations (Catmull-Rom, Cubic Bézier) generally utilize uniform knot vectors or parameterizations based on chord lengths. In these systems, the parameter $t$ ($0.0 \\to 1.0$) does not correspond to physical distance. Traversing the curve at a constant $\Delta t$ results in variable speeds. This makes precise choreographic control (e.g., "move this camera 100 pixels per second") impossible without heavy manual tuning.

## 2\. The solution: Arc-length reparameterization

This proposal implements an arc-length look-up table (LUT) alongside the RMF computation, allowing us to expose `getPointAtLength(length)` and `getTotalLength()` methods. The applications of this approach extend beyond customizable motion to fundamental features such as shape morphing, dashed lines, and placing text along a curved path.

## 3\. Applications to motion

This infrastructure unlocks three critical capabilities for motion graphics in the broader ecosystem:

* **Cinematic camera & object tracking:** Because the RMF method guarantees minimal twist, it is the ideal candidate for camera paths. A camera attached to a frame derived from `getFrameAtLength(t)` will bank smoothly through curves without the violent flipping or twisting artifacts associated with Frenet-Serret or fixed-up implementations.
* **Write-on & write-off effects:** Rendering a tube that grows or recedes along a path becomes a trivial, production-quality operation. Constant-speed motion is built in, allowing pleasing transitions for motion graphics, or handwriting that reveals itself naturally over time. Text can even be made to flow along bespoke curves at a prescribed speed.  
* **Composable easing:** A user can define a complex spatial trajectory, and then apply a bounce or spring easing function to the traversal progress, trusting that the visual output will map 1:1 to their timing logic. This works because arc-length parameterization effectively decouples the *geometry* (the path) from the *timing* (the motion). This allows developers to compose paths with expressive easing features.

# Community & usage
Using this spec or the proof-of-concept code in your project? We'd love to see it!
Drop a link in the ["Show and tell" discussion thread](https://github.com/GregStanton/proposal-rmf-engine/discussions/1).

# Citation & license

[![License: CC BY 4.0](https://licensebuttons.net/l/by/4.0/88x31.png)](https://creativecommons.org/licenses/by/4.0/)

If you use this architectural specification or the underlying design patterns in non-academic work, please cite it as:

> [*RMF Engine for creative coding: High-fidelity sweep geometries and rails*](https://github.com/GregStanton/proposal-rmf-engine) by Greg Stanton (2025), licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)

For academic work, references in other formats (IEEE, ACM, APA, etc.) are fine! A BibTeX citation is included below.

<details>
<summary>BibTeX citation</summary>

```bibtex
@misc{stanton2025rmf,
  author = {Stanton, Greg},
  title = {RMF Engine for creative coding: High-fidelity sweep geometries and rails},
  year = {2025},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/GregStanton/proposal-rmf-engine}}
}
```

</details>

### Repository license summary

* **Architectural spec ("RMF Engine for creative coding..." in this README):** [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) (as noted above)
* **Source code & implementation:** [MIT License](LICENSE) (all code files, algorithms, and inline code comments are strictly MIT)
