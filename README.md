# RMF Engine for creative coding: <br /> High-fidelity sweep geometries and rails

We propose a high-fidelity _RMF Engine_ designed to be a robust geometric core for a broad expanse of creative-coding features, ranging from expressive geometries to choreographed motions. To illustrate the unifying force of the underlying rotation minimizing frames, we present an intuitive and highly expressive API to go on top. 

We use a state-of-the-art technique to eliminate distortions inherent to standard approaches. While this proposal centers on sweep geometries, the method also provides a reusable, composable system that supports a wide range of motion-based applications. These are briefly introduced in an appendix.

**Status:** Stage 0 (Strawman)—*Proof of concept in development*  
**Author:** Greg Stanton   
**Target:** Proof of Concept by November 28, 2025

# Problem

Sweep geometries are extremely useful in computer graphics. They sweep a 2D shape (a _profile_ or _cross section_) across a 3D-space curve (_spine_, _backbone_, or _rail_). This essential feature is available in a wide range of graphics software (including [three.js](https://threejs.org/docs/#ExtrudeGeometry), [Blender](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/curve/operations/curve_to_mesh.html), [Houdini](https://www.sidefx.com/docs/houdini/nodes/sop/sweep.html#:~:text=18.0-,Overview,parameter%20on%20the%20Construction%20tab.), [Maya](https://help.autodesk.com/view/MAYAUL/2024/ENU/?guid=GUID-04C6192A-1524-48FA-B5BC-7745FC25D26D), and [Autocad](https://help.autodesk.com/view/ACD/2025/ENU/?guid=GUID-2391CE97-3794-402C-8BC1-E2DCB452DD13)). 

Essential use cases include ribbons, tubes, and brushes. A ribbon is a surface that results from sweeping an open profile curve across the spine curve. These can be made to look like physical ribbons. A tube is a surface or solid that results from sweeping a closed curve across the spine curve. These can be made to look like the tube in a neon sign. A brush is a 2D profile that may be a set of discrete points or a mixture of different shape kinds. By setting a fixed orientation, a calligraphy brush may be created. In all cases, the profile may be scaled or rotated as it’s swept out, creating dynamic and twisting shapes.

However, these features are subject to well known pain points for users, including distortions that result from inflection points. Implementations like the one currently in three.js fail to address the problem. In popular creative-coding libraries using a `beginShape()`/`endShape()` API—including p5.js, Processing, and openFrameworks—no dedicated feature for producing sweep geometries exists at all. This significantly reduces the API’s artistic expressiveness.

# Solution

We present a solution that enriches the fundamental concept of a stroke, expanding it into an intuitive, expressive system for creating dynamic and textured 2D lines, as well as 3D ribbons, tubes, and rails.

## API

The revised `beginShape()`/`endShape()` API introduced in p5.js 2.0 is extremely intuitive and extensible. The implementation overhaul also introduced a new `p5.Shape` class (this class has not yet been exposed to the user, but this is planned, once the class is sufficiently stable). 

We will discuss how this API may be extended to sweep geometries. The solution described here leverages the new p5 API to make the creation of these flexible geometries incredibly natural.

### General usage

Extend the shape `kind` parameter of `beginShape()` to support a single new value: `SWEEP`. This kind works with all path primitives (polylines via `vertex()`, Bézier curves via `bezierVertex()`, and interpolating splines via `spline()`).

### Profile definition

Provide a `sweepSlice(slice)` setter, where `slice` may be any 2D `p5.Shape` object, or an object literal specifying a primitive shape directly (e.g., `{shape: circle, x: 0, y: 0, radius: 1}`). The default slice is the unit circle centered at the origin.

* **Attachment:** The coordinate system of the 2D profile shape is mapped directly to the coordinate system of the spine’s local normal plane, with the origin of the profile plane placed exactly at the spine vertex.  
* **Offsetting:** This allows for implicit offsetting. For example, if a user defines a profile circle centered at $(10, 0)$, the resulting tube will float $10$ units away from the spine path.

### 2D sweep geometries

The `SWEEP` kind is supported in 2D sketches. These are treated as 3D sketches where the spine lies on the z \= 0 plane. The profile x-axis maps to the spine normal (in the canvas plane), and the profile y-axis maps to the spine binormal (the global z-axis).

1. **Calligraphy brushes:** A profile line segment on the x-axis creates a flat ribbon on the canvas. In `FIXED` mode (see below), this creates a calligraphic effect where the stroke thins out when the curve turns parallel to the line.  
2. **Vertical walls:** A profile line segment on the y-axis creates a vertical fence rising out of the canvas. (Note: In a standard 2D view, this would be invisible or render as a hairline, as the camera looks directly down the polygon's edge).

### Orientation modes

To resolve the conflict between organic forms (which minimize twist) and architectural forms (which require a consistent "up" direction), we introduce `sweepMode(mode | vector)`:

* **`FREE` (Default):** Ideal for organic knots and vines.  
* **`FIXED`:** Forces a fixed orientation. Prevents "banking" on curves. Ideal for roads and UI elements.  
* **Custom vector:** If a vector is provided, it serves as a slice normal. The orientation of the profile plane is locked by this normal throughout the sweep. In the case of a 2D sweep geometry, the profile acts as a calligraphy brush.

### Transformations

Here, a _vertex attribute_ is an attribute that may be applied at the level of individual vertices, or globally, by allowing an attribute applied to one vertex to fall through to subsequent vertices.

* **Scaling:** The `sweepSliceScale(scale)` vertex attribute acts as a multiplier, just like the p5 `scale()` function, except that it applies only to the sweep slice, rather than the entire canvas.  
* **Rotating:** Rotation is controlled via the `sweepSliceRotation(angle)` vertex attribute. Angle values are treated as absolute linear `Number` values rather than modular angles. This allows for multi-turn twists (e.g., 0 to $4\pi$). To create a seamless twisted loop, the user specifies the start rotation (e.g., 0\) and the end rotation (e.g., $2\pi$) manually.

### Stroke attributes

* The `strokeWeight()` vertex attribute resizes the profile so the maximum dimension of its bounding box matches the provided weight. It’s an absolute resizing function, to complement the relative `sweepSliceScale(scale)`.  
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

Here, we outline high-level aspects of a robust implementation.

### Sweeping

To solve the distortion problem inherent to Frenet-Serret frames, we can implement the state-of-the-art method known as *double reflection*. Compared to previous solutions, this technique improves accuracy, simplicity, and speed. More precisely, *it offers* $\mathcal{O}(h^4)$ *accuracy*, compared to the standard $\mathcal{O}(h^2)$, ensuring stability even with fewer samples.

The technique was introduced by Wang, Jüttler, Zheng, and Liu (2008), researchers at the University of Hong Kong and Johannes Kepler University, in the paper *Computation of Rotation Minimizing Frames*. A recent overview of related techniques may be found in *Balancing Rotation Minimizing Frames with Additional Objectives* by Mossman, Bartels, and Samavati (2023), representing research from the University of Calgary and the University of Waterloo.

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

### Closure & holonomy correction

Closed loops present a specific geometric challenge known as *holonomy*: the final RMF frame $U_{end}$ often arrives with a rotational offset relative to the starting frame $U_{start}$. This results in a visible seam or "snap" where the geometry connects.

While standard implementations (like those in naive Blender scripts) often correct this by distributing the error linearly across the parameter $t$, this approach causes visual artifacts (uneven twisting) when control points are not equidistant (Blender Foundation, 2025).

Following the variational principles established by Wang et al. (2008), we implement a *Minimal Total Squared Angular Speed* correction. This requires distributing the angular error proportional to the *arc length* of the curve, not the parameter $t$.

**Cohesive architecture:** This requirement necessitates the existence of an *Arc-Length Parameterization System* within the core geometry engine. A 2002 review of techniques (Wang et. al.) suggests a Look-Up Table (LUT) approach. While the original motivation is to ensure seamless geometric continuity, this LUT approach opens the door to exciting capabilities in motion choreography (see Appendix).

# Proof of concept

The code in this repository is meant to validate the performance and stability of the RMF algorithm before proposing a merge into p5.js or other software. To isolate the mathematical core from any framework overhead, I have chosen to implement the engine in a standalone, raw WebGL environment.

# References

Blender Foundation. (2025). *Blender 4.3 Reference Manual: Curve Shape*. Retrieved from [https://docs.blender.org/manual/en/latest/modeling/curves/properties/shape.html](https://docs.blender.org/manual/en/latest/modeling/curves/properties/shape.html)

Mossman, C., Bartels, R. H., & Samavati, F. F. (2023). Balancing rotation minimizing frames with additional objectives. *Computer Graphics Forum*, *42*(7), e14979.

Wang, H., Kearney, J., & Atkinson, K. (2002, June). Arc-length parameterized spline curves for real-time simulation. In Proc. 5th International Conference on Curves and Surfaces (Vol. 387396).

Wang, W., Jüttler, B., Zheng, D., & Liu, Y. (2008). Computation of rotation minimizing frames. *ACM Transactions on Graphics (TOG)*, *27*(1), 1-18.

# Appendix: Opening the door to customizable motion

While the primary focus of this proposal is static geometry generation, the underlying Rotation Minimizing Frame (RMF) system serves as a powerful engine for motion and animation. By decoupling the coordinate frame computation from the mesh generation, we create a reusable system for establishing rails in 3D space that other systems can ride upon.

## 1\. The problem of parameterization

Standard spline implementations (Catmull-Rom, Cubic Bézier) generally utilize uniform knot vectors or parameterizations based on chord lengths. In these systems, the parameter $t$ ($0.0 \\to 1.0$) does not correspond to physical distance. Traversing the curve at a constant $\Delta t$ results in variable speeds. This makes precise choreographic control (e.g., "move this camera 100 pixels per second") impossible without heavy manual tuning.

## 2\. The solution: Arc-length reparameterization

This proposal implements an arc-length look-up table (LUT) alongside the RMF computation, allowing us to expose a `getPointAtLength(distance)` method (and its normalized sibling `getPointAtNormalizedLength(0..1)`). The applications of this approach extend beyond customizable motion to fundamental features such as shape morphing, dashed lines, and placing text along a curved path.

## 3\. Applications to motion

This infrastructure unlocks three critical capabilities for the broader ecosystem:

* **Cinematic camera & object tracking:** Because the RMF method guarantees minimal twist, it is the ideal candidate for camera paths. A camera attached to a frame derived from `getFrameAtLength(t)` will bank smoothly through curves without the violent "flipping" artifacts associated with `lookAt()` or Frenet-Serret implementations.  
* **Write-on & write-off effects:** Rendering a tube that grows or recedes along a path becomes a trivial, production-quality operation. Constant-speed motion is built in, allowing pleasing transitions for motion graphics, or handwriting that reveals itself naturally over time. Text can even be made to flow along bespoke curves at a prescribed speed.  
* **Composable easing:** A user can define a complex spatial trajectory, and then apply a bounce or spring easing function to the traversal progress, trusting that the visual output will map 1:1 to their timing logic. This works because arc-length parameterization effectively decouples the *geometry* (the path) from the *timing* (the motion). This allows developers to compose paths with expressive easing features.
