# WebGL2 & GLSL Primer: <br /> A zero-to-hero, spaced-repetition guide

**Status:** Drafting in progress  
**Author:** Greg Stanton

These notes take the reader from _zero_ (no knowledge of WebGL2 or GLSL) to _hero_ (confidence in everything from low-level state management to 3D graphics production). Diagrams and references on prerequisite concepts are provided. Following the prerequisite material, the notes introduce the fundamentals of WebGL2 and GLSL in a natural order, chunking concepts and syntax into a Q&A format, suitable for spaced-repetition practice with software like [Anki](https://apps.ankiweb.net/). Projects are integrated throughout, with solution code, to provide practice applying ideas as soon as they’re introduced.

# Background
Before diving in, we need to make sure we have some prerequisite concepts and skills in place.

## Prerequisite topics

Knowledge of HTML and JavaScript is assumed. Diagrams and references are provided for the following prerequisite topics in computer graphics:

* 3D primitives, including triangle strips and triangle fans
* Homogeneous coordinates in projective geometry
* Matrix representations of linear, affine, and projective transformations
* Transforms in the standard 3D rendering pipeline

## Prerequisite diagrams and references

This section contains references and diagrams covering the graphics preqrequisites.

### Drawing modes

The image below is sufficient for understanding WebGL drawing modes (shape “kinds” in p5.js):

<img 
  width="828" 
  height="517" 
  alt="A diagram illustrating the meaning of each drawing mode available in WebGL, including the following: `gl.POINTS`, `gl.LINES`, `gl.LINE_STRIP`, `gl.LINE_LOOP`, `gl.TRIANGLES`, `gl.TRIANGLE_STRIP`, `gl.TRIANGLE_FAN`."
  src="https://github.com/user-attachments/assets/3cd05534-3f2a-412c-a10e-e29ef8e6bd52" 
/>

*Attribution:* [“*Available WebGL shapes”*](https://miro.medium.com/v2/resize:fit:1100/format:webp/0*HQHB5lCGqlOUiysy.jpg) *appears in [A Brief Introduction to WebGL](https://medium.com/trabe/a-brief-introduction-to-webgl-5b584db3d6d6), by Martín Lamas.*

### Homogeneous coordinates and matrix transformations
A [brief overview of the relevant math concepts](https://math.hws.edu/graphicsbook/c3/s5.html) can be found in the online book _Introduction to Computer Graphics_, by David J. Eck. Regarding matrix representations, knowledge of the inner structure of the matrices is not required. All that’s required is an understanding that matrix multiplication represents geometric transformations. Specific APIs for programming matrix operations are not assumed in these notes.

### Overview of coordinate systems
It’s enough to understand the significance of each source and target space, from local to screen space, and to know the sequence of transformations between them. For the relevant context, see [Projection and viewing](https://math.hws.edu/graphicsbook/c3/s3.html) in Eck, or [Coordinate Systems](https://learnopengl.com/Getting-started/Coordinate-Systems) in the online book _Learn OpenGL_, by [Joey de Vries](https://joeydevries.com/#home).

<img 
  width="800" 
  height="394" 
  alt="A diagram showing the standard sequence of 3D graphics transforms, from local to world space (via the model matrix), from world to view space (via the view matrix), from view space to clip space (via the projection matrix), and from clip space to screen space (via the viewport transform)."
  src="https://github.com/user-attachments/assets/197931d8-81bc-4b73-ac91-34c7111fa18a" 
/>

*Attribution:* [*coordinate_systems.png*](https://learnopengl.com/img/getting-started/coordinate_systems.png) *by [Joey de Vries](https://x.com/JoeyDeVriez) appears in [Coordinate Systems](https://learnopengl.com/Getting-started/Coordinate-Systems) and is licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)*.

### Normalized device coordinates
We'll be directly dealing with normalized-device coordinates early on. WebGL automatically converts clip-space coordinates to normalized-device coordinates, prior to applying the viewport transform.

<img 
  width="503" 
  height="440" 
  alt = "A cubic space, with a coordinate system whose origin is at the center of the cube. A horizontal axis points right, a vertical axis points up, and a depth axis points away. Values along each axis range between -1 and 1."
  src="https://github.com/user-attachments/assets/ea261f7e-18ed-4141-81fd-3e6de54513ce"
/>

*Attribution:* *Image of NDC space (referred to as “clipspace” in original source) appears in [WebGL model view projection - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection) and is licensed under [CC BY SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en).*

## Recommended experience

The following background experience is helpful but not necessary:

* Very basic familiarity with typed languages  
* Experience creating graphics with a high-level library like [p5.js](https://p5js.org/) (especially `beginShape([kind])`/`endShape([mode])`)

## Anki tip: Learning lists
For convenience, the Q&A _cards_ in these notes will sometimes have a full list as an answer. List answers tend to be more cognitively demanding, and therefore can disrupt mental flow unnecessarily. If you find this to be the case during your own spaced-repetition practice, you can customize one of the following methods according to your own background: 

* Accompany the answer with a hint containing a single **acronym or a mnemonic phrase** (e.g. in biology, "Do kings play chess on fine green silk?" is a mnemonic for domain, kingdom, phylum, class, order, family, genus, species)
* Accompany the answer with a hint explaining how to **chunk** a longer list into only 3–4 items
* Implement lists using **cloze deletion** in software like Anki (e.g. create a sequence of cards in which all list items are revealed except for one)
* Create cards explaining how each list item connects conceptually to its neighbors (a form of **elaborative encoding**)

# Introduction
<details>
<summary>
  <strong>Q:</strong> 
  What are the geometric primitives in WebGL?
</summary>
<p>
  <strong>A:</strong>
  Points, lines, and triangles. (Typically, it’s all triangles.)
</p>
<p>
  <strong>Source:</strong> 
  <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html">WebGL2 Fundamentals</a>, <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-points-lines-triangles.html">WebGL2 Points, Lines, and Triangles</a>, <a href="https://en.wikipedia.org/wiki/Geometric_primitive">Geometric primitive - Wikipedia</a>
</p>
</details>

<details>
<summary><strong>Q:</strong> What’s the mathematical term for the simplest n-dimensional shape?</summary>
<p><strong>A:</strong> Simplex (plural, simplexes or simplices)</p>
<p><strong>Note:</strong> A 0-dimensional simplex is a point, a 1-dimensional simplex is a line, and a 2-dimensional simplex is a triangle. (A 3-dimensional simplex is a tetrahedron, which is made up of triangles.)</p>
<p><strong>Source:</strong> <a href="https://en.wikipedia.org/wiki/Simplex">Simplex - Wikipedia</a></p>
</details>

<details>
<summary><strong>Q:</strong> What hardware component does WebGL run on?</summary>
<p><strong>A:</strong> The GPU (graphics processing unit)</p>
<p><strong>Source:</strong> <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html">WebGL2 Fundamentals</a>, <a href="https://en.wikipedia.org/wiki/Graphics_processing_unit">Graphics processing unit - Wikipedia</a></p>
</details>

<details>
<summary><strong>Q:</strong> What two pieces of code comprise a WebGL program? Name them.</summary>
<p><strong>A:</strong> A <em>vertex shader</em> and a <em>fragment shader</em>.</p>
<p><strong>Source:</strong> <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html">WebGL2 Fundamentals</a></p>
</details>

<details>
<summary><strong>Q:</strong> Vertex shaders and fragment shaders are code units of what type? (Are they modules, objects, functions, or something else?)</summary>
<p><strong>A:</strong> They’re functions.</p>
<p><strong>Source:</strong> <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html">WebGL2 Fundamentals</a></p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what language is used to code vertex shaders and fragment shaders?</summary>
<p><strong>A:</strong> GLSL (OpenGL Shading Language)</p>
<p><strong>Note:</strong> More precisely, WebGL uses GLSL ES, which is a bit different.</p>
<p><strong>Source:</strong> <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html">WebGL2 Fundamentals</a>, <a href="https://en.wikipedia.org/wiki/OpenGL_Shading_Language">OpenGL Shading Language - Wikipedia</a></p>
</details>

<details>
<summary><strong>Q:</strong> What does “OpenGL” stand for?</summary>
<p><strong>A:</strong> Open Graphics Library</p>
<p><strong>Source:</strong> <a href="https://en.wikipedia.org/wiki/OpenGL">OpenGL - Wikipedia</a></p>
</details>

<details>
<summary><strong>Q:</strong> Must variable and function declarations have a declared type in GLSL?</summary>
<p><strong>A:</strong> Yes.</p>
<p><strong>Source:</strong> <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html">WebGL2 Fundamentals</a>, <a href="https://en.wikipedia.org/wiki/Type_system">Type system - Wikipedia</a>, <a href="https://registry.khronos.org/OpenGL/specs/gl/GLSLangSpec.4.60.pdf">The OpenGL® Shading Language, Version 4.60.8</a> (page 26)</p>
</details>

<details>
<summary><strong>Q:</strong> What general-purpose language is the syntax of GLSL patterned after?</summary>
<p><strong>A:</strong> C</p>
<p><strong>Source:</strong> <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html">WebGL2 Fundamentals</a>, <a href="https://en.wikipedia.org/wiki/OpenGL_Shading_Language#:~:text=OpenGL%20Shading%20Language%20\(GLSL\)%20is,on%20the%20C%20programming%20language">OpenGL Shading Language - Wikipedia</a></p>
</details>

<details>
<summary><strong>Q:</strong> In computer graphics, what is a vertex?</summary>
<p><strong>A:</strong> As in geometry, a vertex is one of a set of points that defines a shape (e.g. the three corners of a triangle). A vertex may have additional attributes for rendering (drawing), such as a color.</p>
<p><strong>Source:</strong> <a href="https://en.wikipedia.org/wiki/Vertex_\(computer_graphics\)">Vertex (computer graphics) - Wikipedia</a>, <a href="https://en.wikipedia.org/wiki/Vertex_\(geometry\)">Vertex (geometry) - Wikipedia</a></p>
</details>

<details>
<summary><strong>Q:</strong> What does a vertex shader do?</summary>
<p><strong>A:</strong> It computes vertex positions. (These determine where geometric primitives are rendered on the screen.)</p>
<p><strong>Source:</strong> <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html">WebGL2 Fundamentals</a></p>
</details>

<details>
<summary><strong>Q:</strong> In computer graphics, what is a pixel?</summary>
<p><strong>A:</strong> It’s the smallest visual element on a screen. (It’s also known as a “picture element,” analogous to a chemical element in the periodic table). It’s usually a tiny square.</p>
<p><strong>Source:</strong> <a href="https://en.wikipedia.org/wiki/Pixel">Pixel - Wikipedia</a>, <a href="https://en.wikipedia.org/wiki/Chemical_element">Chemical element - Wikipedia</a></p>
</details>

<details>
<summary><strong>Q:</strong> What does a fragment shader do?</summary>
<p><strong>A:</strong> It computes pixel colors. (It does this for each pixel in the primitive being drawn.)</p>
<p><strong>Source:</strong> <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html">WebGL2 Fundamentals</a></p>
</details>

<details>
<summary><strong>Q:</strong> What software design pattern best describes the behavior of the WebGL context (`gl`)?</summary>
<p><strong>A:</strong> A State Machine. (You set a state, and it persists until changed).</p>
</details>

<details>
<summary><strong>Q:</strong> What is a state machine?</summary>
<p><strong>A:</strong> A mathematical model of computation defined by a list of states, initial values for those states, and the inputs that trigger each transition.</p>
<p><strong>Source:</strong> <a href="https://en.wikipedia.org/w/index.php?title=Finite-state_machine&oldid=1323472796">Finite-state machine on Wikipedia</a></p>
</details>

<details>
<summary><strong>Q:</strong> In the DOM, what HTML element provides the drawing surface for WebGL?</summary>
<p><strong>A:</strong> The <code>&lt;canvas&gt;</code> element.</p>
</details>

<details>
<summary><strong>Q:</strong> How do we access the WebGL2 API?</summary>
<p><strong>A:</strong> <code>canvas.getContext('webgl2')</code></p>
</details>

<details>
<summary><strong>Q:</strong> What does <code>canvas.getContext('webgl2')</code> return?</summary>
<p><strong>A:</strong> The <code>WebGL2RenderingContext</code></p>
</details>

<details>
<summary><strong>Q:</strong> The <code>WebGL2RenderingContext</code> is often given what abbreviated name in code?</summary>
<p><strong>A:</strong> <code>gl</code></p>
</details>

<details>
<summary><strong>Q:</strong> What is the 2D version of <code>WebGL2RenderingContext</code>?</summary>
<p><strong>A:</strong> <code>CanvasRenderingContext2D</code>.</p>
</details>

# Hello canvas
It’s time to make our first project! We just need to learn a few additional concepts.

## Colors and buffers

<details>
<summary><strong>Q:</strong> What color space is used by the WebGL context?</summary>
<p><strong>A:</strong> RGBA (red, green, blue, alpha)</p>
</details>

<details>
<summary><strong>Q:</strong> What is the valid range for color values in WebGL (red, green, blue, and alpha)?</summary>
<p><strong>A:</strong> <code>0.0</code> to <code>1.0</code> (floating point numbers).</p>
</details>

<details>
<summary><strong>Q:</strong> In a WebGL RGBA color, what value of A (alpha) indicates full opacity?</summary>
<p><strong>A:</strong> <code>1.0</code></p>
</details>

<details>
<summary><strong>Q:</strong> In a WebGL context, what function sets the canvas color? Include any parameters.</summary>
<p><strong>A:</strong> <code>gl.clearColor(r, g, b, a)</code></p>
</details>

<details>
<summary><strong>Q:</strong> What does <code>gl.clearColor(r, g, b, a)</code> do?</summary>
<p><strong>A:</strong> It sets the "clear color" state but does <em>not</em> change the colors on the screen.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what basic function erases buffers and assigns them preset values? Include any parameters.</summary>
<p><strong>A:</strong> <code>gl.clear(mask)</code></p>
</details>

<details>
<summary><strong>Q:</strong> What are the standard buffers that <code>gl.clear()</code> can affect?</summary>
<p><strong>A:</strong> Color, Depth, Stencil</p>
</details>

<details>
<summary><strong>Q:</strong> When calling <code>gl.clear()</code>, what constant do we pass to clear the color buffer?</summary>
<p><strong>A:</strong> <code>gl.COLOR_BUFFER_BIT</code></p>
</details>

<details>
<summary><strong>Q:</strong> When calling <code>gl.clear()</code>, what constant do we pass to clear the depth buffer?</summary>
<p><strong>A:</strong> <code>gl.DEPTH_BUFFER_BIT</code></p>
</details>

<details>
<summary><strong>Q:</strong> Why does <code>gl.clear()</code> accept a bitmask as its parameter?</summary>
<p><strong>A:</strong> To allow multiple buffers to be cleared simultaneously via a bitwise OR operation. (This is an optimization that eliminates the need for multiple function calls.)</p>
</details>

<details>
<summary><strong>Q:</strong> To clear multiple buffers <code>buffer1</code> and <code>buffer2</code> simultaneously with <code>gl.clear()</code>, what syntax is used?</summary>
<p><strong>A:</strong> Syntax: <code>gl.clear(buffer1 | buffer2)</code>. This uses the bitwise OR operator: <code>|</code> (a single pipe character).</p>
</details>

## Project 1: Colored canvas
<img width="250" height="250" alt="yellow canvas" src="https://github.com/user-attachments/assets/0498abe0-4899-4204-9549-36e62a7644fa" />
<p>
  <strong>Problem:</strong>
  Set up an `index.html` file and a JavaScript file. Make a canvas, get the WebGL context, and use it to set the canvas to a color of your choosing.
</p>
<details>
  <summary><strong>Solution:</strong></summary>

```html  
<!DOCTYPE html>  
<html lang="en">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>Yellow canvas</title>  
</head>
<body>  
    <canvas id="yellow-canvas" width="400" height="400">  
      A canvas painted yellow.  
    </canvas>
    <script src="yellow-canvas.js"></script>  
</body>  
</html>  
```

```javascript  
const canvas = document.getElementById('yellow-canvas');  
const gl = canvas.getContext('webgl2');  
const yellow = [243 / 255, 208 / 255, 62 / 255, 1];

gl.clearColor(...yellow);  
gl.clear(gl.COLOR_BUFFER_BIT);  
```
</details>

# Hello triangle
Now we'll work toward getting a triangle on the screen. This will take some work, since we're going to make sure we understand all the low-level boilerplate.

## Starting the data bridge (getting CPU data onto the GPU)

<details>
<summary><strong>Q:</strong> In WebGL, what does VBO stand for?</summary>
<p><strong>A:</strong> Vertex Buffer Object</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what is the general purpose of a VBO?</summary>
<p><strong>A:</strong> To store data in the GPU's memory.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what sorts of data are commonly stored in a VBO?</summary>
<p><strong>A:</strong> Vertex attribute data like positions, normals, colors, and texture coordinates.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, data in a VBO is stored in what data format?</summary>
<p><strong>A:</strong> Binary</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what does VAO stand for?</summary>
<p><strong>A:</strong> Vertex Array Object</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what is the purpose of a VAO?</summary>
<p><strong>A:</strong> Recording how to read data from the VBOs. (This is typically vertex-attribute data, hence the name.)</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what does the term "Binding" mean?</summary>
<p><strong>A:</strong> Setting an object (e.g. a VBO) as the "active" value for a particular state in the WebGL state machine.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what is the order of operations for creating and configuring the VAO and VBO?</summary>
<p><strong>A:</strong></p>
<ol>
<li>Create and Bind the VAO.</li>
<li>Create and Bind the VBO.</li>
<li>Upload buffer data.</li>
<li>Configure attributes (tell VAO how to read the VBO).</li>
</ol>
<p><strong>Hint:</strong> Since the WebGL context is a state machine, it needs a place to define state (VAO) <em>before</em> it can organize the data values (VBO). Once these are in place, we need to upload data, then tell the VAO how to read it.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what syntax creates a Vertex Array Object?</summary>
<p><strong>A:</strong> <code>gl.createVertexArray()</code> (this function does not take parameters)</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what syntax binds a VAO?</summary>
<p><strong>A:</strong> <code>gl.bindVertexArray(vao)</code></p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what syntax creates a buffer (VBO)?</summary>
<p><strong>A:</strong> <code>gl.createBuffer()</code> (this function does not take parameters)</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what syntax binds a buffer?</summary>
<p><strong>A:</strong> <code>gl.bindBuffer(target, buffer)</code></p>
</details>

<details>
<summary><strong>Q:</strong> What are the two most common targets for <code>gl.bindBuffer</code>?</summary>
<p><strong>A:</strong> <code>gl.ARRAY_BUFFER</code>, <code>gl.ELEMENT_ARRAY_BUFFER</code></p>
</details>

<details>
<summary><strong>Q:</strong> What kind of data is usually bound to <code>gl.ARRAY_BUFFER</code>?</summary>
<p><strong>A:</strong> Vertex attributes (e.g. position, normal, color, texture data)</p>
</details>

<details>
<summary><strong>Q:</strong> What kind of data is usually bound to <code>gl.ELEMENT_ARRAY_BUFFER</code>?</summary>
<p><strong>A:</strong> Index data (indicating which vertices to connect)</p>
</details>

<details>
<summary><strong>Q:</strong> Can you give a concrete example to indicate the purpose of <code>gl.ELEMENT_ARRAY_BUFFER</code>?</summary>
<p><strong>A:</strong> Suppose you want to create a quadrilateral from four vertices. This needs to be created out of triangles, and there are two ways to triangulate a quadrilateral. The element array buffer can be used to specify the triangulation, by indicating which vertices should be connected.</p>
</details>

<details>
<summary><strong>Q:</strong> What syntax sends data to the currently bound buffer?</summary>
<p><strong>A:</strong> <code>gl.bufferData(target, data, usage)</code></p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.bufferData(target, data, usage)</code>, the <code>data</code> argument usually has what type?</summary>
<p><strong>A:</strong> <code>Float32Array</code></p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.bufferData</code>, if the geometry will not change after it is uploaded, what usage constant should be passed?</summary>
<p><strong>A:</strong> <code>gl.STATIC_DRAW</code></p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, an attribute will not be used unless you explicitly turn it on, using what function? Name the function (don’t specify any parameters).</summary>
<p><strong>A:</strong> <code>gl.enableVertexAttribArray()</code></p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what function tells the VAO how to interpret the data in the currently bound VBO? Name the function (don’t specify any parameters).</summary>
<p><strong>A:</strong> <code>gl.vertexAttribPointer()</code></p>
</details>

## Coordinates expected by WebGL

<details>
<summary><strong>Q:</strong> In WebGL, vertex coordinates in a VBO are expected to be in what space? Name the space and indicate the pipeline transform that maps to it.</summary>
<p><strong>A:</strong> Clip space. It’s the target space of the projection transform.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, vertex coordinates in clip space are automatically converted to what space, after the vertex shader runs?</summary>
<p><strong>A:</strong> NDC space (normalized device coordinates).</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what operation sends clip space to NDC space?</summary>
<p><strong>A:</strong> Perspective division: The point (x, y, z, w) is divided by w.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what is the range of x, y, and z in NDC space?</summary>
<p><strong>A:</strong> -1.0 to 1.0.</p>
</details>

<details>
<summary><strong>Q:</strong> In a WebGL vertex shader, if you define an attribute as a <code>vec4</code> but only provide (x, y) data from the buffer, what values are automatically assigned to z and w?</summary>
<p><strong>A:</strong> <code>z</code> = 0.0, <code>w</code> = 1.0. (Hint: Recall that a w-coordinate of 1 makes the vertex a point, rather than a direction, i.e. it is affected by translations.)</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL Normalized Device Coordinates (NDC), where is the origin (0,0)?</summary>
<p><strong>A:</strong> The center.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL Normalized Device Coordinates (NDC), in which direction do the x, y, and z axes point?</summary>
<p><strong>A:</strong> Directions: x points right, y points up, and z points away (directionally, into the screen). (Hint: The xy-plane follows mathematical conventions: x points right and y points up. However, it’s a left handed system.)</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, the depth buffer typically contains values in what range?</summary>
<p><strong>A:</strong> 0.0 to 1.0 (Hint: These are non-negative, as we’d expect of “depth” values, since “depth” implies a distance measured in only one direction. The depth range may be customized, but this is rarely necessary.)</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, the values in the depth buffer are determined by what transformation? Name it.</summary>
<p><strong>A:</strong> The viewport transform.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what are the source and target spaces of the viewport transform?</summary>
<p><strong>A:</strong> NDC $\to$ screen space.</p>
</details>

<details>
<summary><strong>Q:</strong> Conceptually, what does the viewport transform do in WebGL?</summary>
<p><strong>A:</strong> It stretches NDC space so that its x and y dimensions match those of the canvas, and it converts z-values from NDC space (in $[-1, 1]$) to depth values (in $[0, 1]$ by default).</p>
</details>

## Project 2: Set up VBO and VAO, supply triangle data

This project is continued from [Project 1](#project-1-colored-canvas).

<p>
  <strong>Problem:</strong>
  Extend your `yellow-canvas.js` program so that it defines a triangle as a flat array of three $(x, y)$ vertices. Create and bind a VAO and VBO, and upload the triangle data to the VBO. Assume the triangle data will not change after it’s uploaded. (We won't render the triangle yet. We'll do that in the next project.)
</p>

<details>
<summary><strong>Solution:</strong></summary>

```javascript  
// CANVAS
const canvas = document.getElementById('yellow-canvas');
const gl = canvas.getContext('webgl2');
const yellow = [243 / 255, 208 / 255, 62 / 255, 1];

gl.clearColor(...yellow);
gl.clear(gl.COLOR_BUFFER_BIT);

// TRIANGLE
const TAU = 2 * Math.PI;
const r = 2 / 3;
const t0 = TAU / 4;
const dt = TAU / 3;

const triangleVertices = new Float32Array([
  r * Math.cos(t0), r * Math.sin(t0), 
  r * Math.cos(t0 + dt), r * Math.sin(t0 + dt), 
  r * Math.cos(t0 + 2 * dt), r * Math.sin(t0 + 2 * dt),
]);

// STATE MANAGEMENT: VAO AND VBO
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
```
</details>

## GLSL ES 3.00 syntax

<details>
<summary><strong>Q:</strong> In GLSL, what is the syntax to declare a floating-point variable named <code>alpha</code> and initialize it to 1.0?</summary>
<p><strong>A:</strong> <code>float alpha = 1.0;</code></p>
<p><strong>Hint:</strong> It is very similar to C or Java. Semicolons are required.</p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL, <code>vec2</code>, <code>vec3</code>, and <code>vec4</code> refer to vectors whose components have what data type?</summary>
<p><strong>A:</strong> float (floating point number)</p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL, a type (such as <code>vec4</code>) is also a ____________.</summary>
<p><strong>A:</strong> constructor</p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL, how can you create a <code>vec4</code> with components $(0.1, 0.2, 0.3, 0.4)$?</summary>
<p><strong>A:</strong> <code>vec4(0.1, 0.2, 0.3, 0.4)</code></p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL, if <code>pos</code> is a variable of type <code>vec2</code>, how do you create a <code>vec4</code> using <code>pos</code> for the first two components, <code>0.0</code> for <code>z</code>, and <code>1.0</code> for <code>w</code>?</summary>
<p><strong>A:</strong> <code>vec4(pos, 0.0, 1.0)</code></p>
</details>

## Shader syntax

<details>
<summary><strong>Q:</strong> In a WebGL2 shader source string, what must the very first line be?</summary>
<p><strong>A:</strong> <code>#version 300 es</code></p>
<p><strong>Hint:</strong> This refers to GLSL ES 3.00.</p>
</details>

<details>
<summary><strong>Q:</strong> In a WebGL2 shader, what is wrong with the following code?</summary>
```javascript
const shader = `
#version 300 es
// more code here...
`;
```
<p><strong>A:</strong> There is a newline after the backtick, creating a blank line above the version specification. It should look like this instead:</p>
```javascript
const shader = `#version 300 es
// more code here...
`;
```
</details>

<details>
<summary><strong>Q:</strong> In GLSL, which shader stage requires an explicit precision declaration?</summary>
<p><strong>A:</strong> The fragment shader. (Hint: If vertices aren’t in the right place, things go wrong, so high precision is mandated for vertex shaders, but lower precision is allowed for fragment shaders, e.g. to avoid draining battery on older mobile devices.)</p>
</details>

<details>
<summary><strong>Q:</strong> In a GLSL shader, what’s the syntax to declare that floats should have high precision?</summary>
<p><strong>A:</strong> <code>precision highp float;</code></p>
</details>

<details>
<summary><strong>Q:</strong> In a GLSL shader, where does the line of code go that sets the precision of floats?</summary>
<p><strong>A:</strong> The standard location is at the very top (underneath the line that specifies the GLSL version).</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, a shader begins with the execution of what function? What’s the syntax for it?</summary>
<p><strong>A:</strong> <code>void main() {/* code goes here */}</code> (as the syntax indicates, this function takes no parameters and returns no value)</p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL, what’s the general syntactical term for the <code>in</code> and <code>out</code> keywords?</summary>
<p><strong>A:</strong> They are <em>storage qualifiers</em>.</p>
</details>

<details>
<summary><strong>Q:</strong> What do <code>in</code> and <code>out</code> storage qualifiers indicate in a vertex shader?</summary>
<p><strong>A:</strong> <code>in</code> = vertex attribute. <code>out</code> = data to be interpolated (previously a <code>varying</code>).</p>
</details>

<details>
<summary><strong>Q:</strong> What do <code>in</code> and <code>out</code> storage qualifiers indicate in a fragment shader?</summary>
<p><strong>A:</strong> <code>in</code> = interpolated data (previously a <code>varying</code>). <code>out</code> = final fragment color.</p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL ES 3.00, what is the syntax for setting up a “port” for a shader to receive data?</summary>
<p><strong>A:</strong> <code>layout(location = 0) in &lt;type&gt; &lt;variableName&gt;</code></p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL ES 3.00, what is the meaning of <code>layout(location = 0)</code>, in the line <code>layout(location = 0) in &lt;type&gt; &lt;variableName&gt;</code>?</summary>
<p><strong>A:</strong> “Receive data at location 0.”</p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL ES 3.00, what is the meaning of <code>&lt;variableName&gt;</code>, in the line <code>layout(location = 0) in &lt;type&gt; &lt;variableName&gt;</code>?</summary>
<p><strong>A:</strong> This is the name of the variable that contains the data received at location 0.</p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL ES 3.00, where does the line <code>layout(location = 0) in &lt;type&gt; &lt;variableName&gt;</code> go inside a shader?</summary>
<p><strong>A:</strong> It goes in the global scope of the shader, before <code>main()</code>.</p>
</details>

<details>
<summary><strong>Q:</strong> What special built-in variable must the Vertex Shader write to?</summary>
<p><strong>A:</strong> <code>gl_Position</code></p>
</details>

<details>
<summary><strong>Q:</strong> In a GLSL vertex shader, what is the data type of the built-in variable <code>gl_Position</code>?</summary>
<p><strong>A:</strong> <code>vec4</code></p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL ES 3.00, what is the syntax to define the output color variable in a fragment shader?</summary>
<p><strong>A:</strong> <code>out vec4 fragColor;</code> (You can name the variable whatever you want, but <code>fragColor</code> is conventional.)</p>
</details>

<details>
<summary><strong>Q:</strong> In GLSL ES 3.00, where does the code defining the output color variable in a fragment shader go?</summary>
<p><strong>A:</strong> It goes in the global scope of the shader, before <code>main()</code>.</p>
</details>

<details>
<summary><strong>Q:</strong> What does the <code>uniform</code> storage qualifier indicate?</summary>
<p><strong>A:</strong> It indicates a variable that is constant per draw call. (It’s global within the shader.)</p>
</details>

## Finishing the data bridge (configuring attributes)

<details>
<summary><strong>Q:</strong> An attribute will not be used unless it’s explicitly turned on using what syntax?</summary>
<p><strong>A:</strong> <code>gl.enableVertexAttribArray(index)</code></p>
</details>

<details>
<summary><strong>Q:</strong> What’s the signature of <code>gl.vertexAttribPointer()</code>? (Parameter list and return value.)</summary>
<p><strong>A:</strong><br />
<code>gl.vertexAttribPointer(index, size, type, normalized, stride, offset)</code><br />
<em>Return value:</em> None ( <code>undefined</code>).</p>
<p><strong>Hint:</strong> Mentally chunk the parameters into three pairs—<code>index</code>, <code>size</code>; <code>type</code>, <code>normalized</code>; <code>stride</code>, <code>offset</code>.</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.vertexAttribPointer()</code>, what does the <code>index</code> parameter represent?</summary>
<p><strong>A:</strong> The attribute <code>location</code> in the vertex shader.</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.vertexAttribPointer()</code>, what does the <code>size</code> parameter represent?</summary>
<p><strong>A:</strong> The number of components per vertex (e.g., <code>2</code> for a <code>vec2</code>, <code>3</code> for a <code>vec3</code>).</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.vertexAttribPointer()</code>, what does the <code>type</code> parameter represent?</summary>
<p><strong>A:</strong> The data type of the array components (usually <code>gl.FLOAT</code>).</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.vertexAttribPointer()</code>, what does the <code>normalized</code> parameter represent?</summary>
<p><strong>A:</strong> A boolean value indicating whether integer data should be normalized to $[-1, 1]$ or $[0, 1]$ when converted to a float (has no effect for floats, so it's typically set to <code>false</code> in that case, as enabling normalization would have no effect).</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.vertexAttribPointer()</code>, what is a basic use case for the <code>normalized</code> parameter?</summary>
<p><strong>A:</strong> If RGB values for a color are provided in the range $[0, 255]$ (with a <code>type</code> of <code>gl.UNSIGNED_BYTE</code>), setting the <code>normalized</code> parameter to true will automatically convert that data to floats in the required $[0.0, 1.0]$ range for color data.</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.vertexAttribPointer()</code>, what does the <code>stride</code> parameter represent?</summary>
<p><strong>A:</strong> Byte offset (distance in bytes) between the start of one vertex attribute and the next one of the same type. (Equivalently, the number of bytes used to store attributes corresponding to one vertex</p>
<p><strong>Hint:</strong> Imagine attributes are stored like <code>x0, y0, u0, v0, x1, y1, u1, v1…</code> The stride tells WebGL that the memory occupied by <code>x0, y0, u0, v0</code> corresponds to one vertex.</p>
</details>

<details>
<summary><strong>Q:</strong> What term do we use to describe attribute data like <code>x0, y0, u0, v0, x1, y1, u1, v1…</code> in which attributes of different kinds are stored together in the same buffer?</summary>
<p><strong>A:</strong> <em>Interleaved</em></p>
</details>

<details>
<summary><strong>Q:</strong> What term do we use to describe attribute data like <code>x0, y0, x1, y1,…</code> in which attributes in a buffer all have the same kind (e.g. they’re all positions)?</summary>
<p><strong>A:</strong> <em>Tightly packed</em></p>
<p><strong>Hint:</strong> If only positions are represented, then that means there’s zero space between positions (e.g. we don’t have position data, then color data, then position data, etc.).</p>
</details>

<details>
<summary><strong>Q:</strong> What value do we give <code>stride</code> when calling <code>gl.vertexAttribPointer()</code>, if we want data to be tightly packed?</summary>
<p><strong>A:</strong> <code>0</code></p>
<p><strong>Hint:</strong> This is a special case: if <code>0</code> were the byte offset from the start of one position to the start of the next (for example), that’d mean there’s no position data. So WebGL interprets zero to mean “tightly packed,” (e.g. zero bytes between the <em>end</em> of one position and the <em>start</em> of the next).</p>
</details>

<details>
<summary><strong>Q:</strong> If <code>stride</code> is set to zero when calling <code>gl.vertexAttribPointer()</code>, how can WebGL determine the byte offset to get from one attribute to the next?</summary>
<p><strong>A:</strong> WebGL interprets a <code>stride</code> of <code>0</code> to mean the data is tightly packed (e.g. all position data, with no color data in between). It then automatically calculates the correct byte offset based on the <code>size</code> and <code>type</code> parameters.</p>
</details>

<details>
<summary><strong>Q:</strong> When calling <code>gl.vertexAttribPointer()</code>, suppose <code>size</code> is set to <code>3</code>, <code>type</code> is set to <code>gl.FLOAT</code>, and <code>stride</code> is set to zero. WebGL will automatically calculate that the byte offset between attributes is equal to what value?</summary>
<p><strong>A:</strong> A stride of zero means the data is tightly packed, so we have attributes with three components packed right next to each other. A <code>gl.FLOAT</code> consists of 32 bits, which is four bytes (a <em>byte</em> is eight bits). So, the byte offset is 3 components * 4 bytes / component = 12 bytes.</p>
</details>

<details>
<summary><strong>Q:</strong> Roughly, when might it be useful to use tightly packed attributes in a WebGL array buffer?</summary>
<p><strong>A:</strong> Using tightly packed attributes means that all positions would go into one array buffer, all colors would go into another, etc. This can be useful for <strong>dynamic geometry</strong>, e.g. when positions need to be updated but not colors.</p>
</details>

<details>
<summary><strong>Q:</strong> Roughly, when might it be useful to use interleaved attributes in a WebGL array buffer?</summary>
<p><strong>A:</strong> This keeps all data for a single vertex close together in memory, which can be more efficient for <strong>static geometry</strong>, e.g. where it’s not necessary to update positions but keep colors the same. (Interleaved attributes also make it possible to deal with just a single buffer.)</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.vertexAttribPointer()</code>, what does the <code>offset</code> parameter represent?</summary>
<p><strong>A:</strong> The byte offset from the start of the buffer to the first component of the first vertex attribute.</p>
</details>

<details>
<summary><strong>Q:</strong> When <code>gl.vertexAttribPointer()</code> is called, how does WebGL know which VBO to read data from?</summary>
<p><strong>A:</strong> It uses whichever buffer is currently bound to the <code>gl.ARRAY_BUFFER</code> target.</p>
</details>

<details>
<summary><strong>Q:</strong> When <code>gl.vertexAttribPointer()</code> is called, it associates data in the active array buffer with what attribute?</summary>
<p><strong>A:</strong> The attribute at the specified <code>index</code> (location).</p>
</details>

<details>
<summary><strong>Q:</strong> What object stores the configuration set by <code>gl.vertexAttribPointer()</code> and <code>gl.enableVertexAttribArray()</code>?</summary>
<p><strong>A:</strong> The Vertex Array Object (VAO).</p>
</details>

<details>
<summary><strong>Q:</strong> Why do we use VAOs instead of just binding VBOs and setting pointers every frame?</summary>
<p><strong>A:</strong> A VAO allows us to store complex attribute setups once and restore them with a single bind call.</p>
</details>

## WebGL2 shader compilation

<details>
<summary><strong>Q:</strong> In WebGL, what are the high-level steps to setting up a shader object? Answer in words.</summary>
<p><strong>A:</strong></p>
<ol>
<li><em>Create</em></li>
<li><em>Upload</em> (the GLSL source code)</li>
<li><em>Compile</em></li>
<li><em>Check</em> (the compile status)</li>
<li>If compiling failed, <em>Log</em> (the error) and <em>Delete</em> (the shader).</li>
</ol>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what’s the syntax for creating a shader?</summary>
<p><strong>A:</strong> <code>gl.createShader(type)</code></p>
</details>

<details>
<summary><strong>Q:</strong> What are the two types of shaders passed to <code>gl.createShader()</code>?</summary>
<p><strong>A:</strong> <code>gl.VERTEX_SHADER</code> and <code>gl.FRAGMENT_SHADER</code>.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what’s the syntax to upload the GLSL source code string to a shader object?</summary>
<p><strong>A:</strong> <code>gl.shaderSource(shader, sourceString)</code></p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what’s the syntax to compile a shader?</summary>
<p><strong>A:</strong> <code>gl.compileShader(shader)</code></p>
</details>

<details>
<summary><strong>Q:</strong> After compiling a shader, what syntax checks if it succeeded?</summary>
<p><strong>A:</strong> <code>gl.getShaderParameter(shader, gl.COMPILE_STATUS)</code></p>
</details>

<details>
<summary><strong>Q:</strong> What is the return type of <code>gl.getShaderParameter(shader, gl.COMPILE_STATUS)</code>?</summary>
<p><strong>A:</strong> <code>Boolean</code></p>
</details>

<details>
<summary><strong>Q:</strong> If <code>gl.getShaderParameter(shader, gl.COMPILE_STATUS)</code> indicates an error has occurred, what syntax gets a string with information about the error?</summary>
<p><strong>A:</strong> Use <code>gl.getShaderInfoLog(shader)</code>.</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, why should you delete a shader object after it fails to compile?</summary>
<p><strong>A:</strong> If it fails to compile, it’s garbage (useless). Deleting it prevents memory leaks (accumulation of useless memory).</p>
</details>

<details>
<summary><strong>Q:</strong> What function removes a shader object from GPU memory?</summary>
<p><strong>A:</strong> <code>gl.deleteShader(shader)</code></p>
</details>

## WebGL2 program linking

<details>
<summary><strong>Q:</strong> In WebGL, what does it mean to “link” a program?</summary>
<p><strong>A:</strong> Linking a program connects it to dependencies, resulting in a program that’s executable.</p>
</details>

<details>
<summary><strong>Q:</strong> Regarding executability, what is the difference between a shader object and a program object in WebGL?</summary>
<p><strong>A:</strong> A <em>shader</em> is an intermediate (unlinked) compiled stage. A <em>program</em> is linked and ready to run (like an <code>.exe</code>).</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what are the high-level steps to setting up a program object? Answer in words.</summary>
<p><strong>A:</strong></p>
<ol>
<li><em>Create</em></li>
<li><em>Attach</em> (shaders)</li>
<li><em>Link</em> (program)</li>
<li><em>Check</em> (the link status)</li>
<li>If linking failed, <em>Log</em> (error) and <em>Delete</em> (the program).</li>
</ol>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what’s the syntax for creating a program object?</summary>
<p><strong>A:</strong> <code>gl.createProgram()</code> (no parameters)</p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, what’s the syntax for attaching a shader to a program object?</summary>
<p><strong>A:</strong> <code>gl.attachShader(program, shader)</code> (attaches a vertex or a fragment shader)</p>
</details>

<details>
<summary><strong>Q:</strong> After attaching shaders to a program, what syntax connects them into a usable executable?</summary>
<p><strong>A:</strong> <code>gl.linkProgram(program)</code></p>
</details>

<details>
<summary><strong>Q:</strong> After linking a WebGL program, how do you check if it succeeded?</summary>
<p><strong>A:</strong> <code>gl.getProgramParameter(program, gl.LINK_STATUS)</code></p>
</details>

<details>
<summary><strong>Q:</strong> What is the return type of <code>gl.getProgramParameter(program, gl.LINK_STATUS)</code>?</summary>
<p><strong>A:</strong> <code>Boolean</code></p>
</details>

<details>
<summary><strong>Q:</strong> If <code>gl.getProgramParameter(program, gl.LINK_STATUS)</code> indicates an error has occurred, what syntax gets a string with information about the error?</summary>
<p><strong>A:</strong> <code>gl.getProgramInfoLog(program)</code></p>
</details>

<details>
<summary><strong>Q:</strong> In WebGL, why should you delete a program object after it fails to link?</summary>
<p><strong>A:</strong> If it fails to link, it’s garbage (useless). Deleting it prevents memory leaks (accumulation of useless memory).</p>
</details>

<details>
<summary><strong>Q:</strong> What function removes a program object from GPU memory?</summary>
<p><strong>A:</strong> <code>gl.deleteProgram(program)</code></p>
</details>

## Drawing

<details>
<summary><strong>Q:</strong> In the WebGL2 API, what syntax renders primitives?</summary>
<p><strong>A:</strong> <code>gl.drawArrays(mode, first, count)</code></p>
</details>

<details>
<summary><strong>Q:</strong> In the WebGL2 API, what does "arrays" refer to in <code>gl.drawArrays()</code>?</summary>
<p><strong>A:</strong> As it carries out the drawing task, this function aggregates vertex attributes from multiple arrays (e.g. position, color, and texture arrays), assembling all data for vertex 1, then for vertex 2, and so on.</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.drawArrays(mode, first, count)</code>, what are the possible values of the <code>mode</code> parameter? Answer with conceptual descriptions.</summary>
<p><strong>A:</strong> Disconnected points; disconnected lines, an open polyline, or a closed polyline; disconnected triangles, a triangle strip, or a triangle fan.</p>
<p><strong>Hint:</strong> The <code>mode</code> parameter is analogous to the <code>kind</code> parameter in p5's <code>beginShape(kind)</code>.</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.drawArrays(mode, first, count)</code>, what are the possible values of the <code>mode</code> parameter? Answer with variable names.</summary>
<p><strong>A:</strong> <code>gl.POINTS</code>; <code>gl.LINES</code>, <code>gl.LINE_STRIP</code>, <code>gl.LINE_LOOP</code>; <code>gl.TRIANGLES</code>, <code>gl.TRIANGLE_STRIP</code>, <code>gl.TRIANGLE_FAN</code>.</p>
<p><strong>Hint:</strong> The <code>mode</code> parameter is analogous to the <code>kind</code> parameter in p5's <code>beginShape(kind)</code>.</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.drawArrays(mode, first, count)</code>, what does the <code>first</code> parameter represent?</summary>
<p><strong>A:</strong> The starting index to read from, in the arrays of vertex attributes. (Usually 0.)</p>
</details>

<details>
<summary><strong>Q:</strong> In <code>gl.drawArrays(mode, first, count)</code>, what does the <code>count</code> parameter represent?</summary>
<p><strong>A:</strong> The number of vertices to be processed (rendered).</p>
</details>

<details>
<summary><strong>Q:</strong> Before issuing a <code>gl.drawArrays</code> command, what must you tell the GPU, conceptually?</summary>
<p><strong>A:</strong> You must tell it which shader program to use.</p>
</details>

<details>
<summary><strong>Q:</strong> What syntax tells <code>gl.drawArrays</code> which shader program to execute?</summary>
<p><strong>A:</strong> <code>gl.useProgram(program)</code></p>
<p><strong>Hint:</strong> This tells the WebGL state machine: "For all subsequent draw calls, use this specific compiled executable."</p>
</details>

## Project 3: Make boilerplate helper and draw triangle
<img 
  width="250" 
  height="250" 
  alt="yellow canvas with an orange triangle in the center" 
  src="https://github.com/user-attachments/assets/47448258-5800-45aa-8e61-a172ed90d46a" 
/>

<p>
<strong>Goal:</strong> Update <code>yellow-canvas.js</code> to render your existing triangle geometry in orange, on top of the yellow background.
</p>

<p>
<strong>Context:</strong> From <a href="#project-2-set-up-vbo-and-vao-supply-triangle-data">Project 2</a>, you already have the geometry (a <code>Float32Array</code> of 2D coordinates) in a VBO, and a VAO that is currently bound. Now you need to build the program to process that data.
</p>

<strong>Project Specifications:</strong>

1.  <strong>Helper Function:</strong> Create a function <code>createProgram(gl, vsSource, fsSource)</code> at the bottom of your file.
    * It must create two shaders and one program.
    * It must compile the shaders and check their compile status.
    * It must link the program and check its link status.
    * <strong>Constraint:</strong> If any check fails, log the error and <strong>delete</strong> the faulty object to avoid memory leaks. Return <code>null</code> if it fails, or the <code>program</code> if it succeeds.
2.  <strong>Shader Source Code:</strong> Define two template strings, <code>vsSource</code> and <code>fsSource</code>.
    * <strong>Vertex Shader:</strong>
        * Accept an attribute <code>position</code> at location 0. Note that your buffer has 2 numbers per vertex, so this should be a <code>vec2</code>.
        * Output a <code>gl_Position</code>. (Hint: You will need to convert your <code>vec2</code> input.)
    * <strong>Fragment Shader:</strong>
        * Declare the variable to output.
        * Output the color orange: <code>vec4(1.0, 0.4, 0.0, 1.0)</code>.
3.  <strong>Execution:</strong>
    * Call your helper to create the program.
    * Tell WebGL to use this program.
    * Draw the triangle.

<details>
  <summary><strong>Solution:</strong></summary>

```javascript
// CANVAS
const canvas = document.getElementById('yellow-canvas');
const gl = canvas.getContext('webgl2');
const yellow = [243 / 255, 208 / 255, 62 / 255, 1];

gl.clearColor(...yellow);
gl.clear(gl.COLOR_BUFFER_BIT);

// TRIANGLE
const TAU = 2 * Math.PI;
const r = 2 / 3;
const t0 = TAU / 4;
const dt = TAU / 3;

const triangleVertices = new Float32Array([
  r * Math.cos(t0), r * Math.sin(t0), 
  r * Math.cos(t0 + dt), r * Math.sin(t0 + dt), 
  r * Math.cos(t0 + 2 * dt), r * Math.sin(t0 + 2 * dt),
]);

// SHADER SOURCE
const vsSource = `#version 300 es
layout(location = 0) in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fsSource = `#version 300 es
precision highp float;
out vec4 fragColor;

void main() {
  fragColor = vec4(1.0, 0.4, 0.0, 1.0);
}
`;

// STATE MANAGEMENT: VAO AND VBO
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

// CREATE AND USE PROGRAM
const program = createProgram(gl, vsSource, fsSource);
gl.useProgram(program);

// DRAW
gl.drawArrays(gl.TRIANGLES, 0, 3);

// CREATION UTILITIES: SHADERS AND PROGRAM 
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;
  
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}
```
</details>
