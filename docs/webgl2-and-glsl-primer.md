# WebGL2 & GLSL Primer: <br /> A spaced-repetition guide to building a low-level RMF engine from scratch

**Status:** Drafting in progress  
**Author:** Greg Stanton

These notes introduce the fundamentals of WebGL2 and GLSL in a natural order. The concepts and syntax are chunked into a Q&A format, suitable for spaced-repetition practice with software like [Anki](https://apps.ankiweb.net/). Projects are integrated throughout, to provide practice with applying the ideas as soon as they’re introduced.

# Background
Before diving in, we need to make sure we have some prerequisite concepts and skills in place.

## Prerequisite topics

The following topics are assumed:

* HTML and JavaScript  
* 3D primitives, including triangle strips and triangle fans  
* [Homogeneous coordinates](https://en.wikipedia.org/wiki/Homogeneous_coordinates) in projective geometry  
* Matrix representations of linear, affine, and projective transformations  
* Standard 3D rendering pipeline

Regarding matrix representations, knowledge of the inner structure of the matrices is not required. All that’s required is an understanding of how matrix multiplication represents geometric transformations. An [overview of relevant math](https://math.hws.edu/graphicsbook/c3/s5.html) can be found in the online book Introduction to Computer Graphics, by David J. Eck.

Regarding the 3D rendering pipeline, it’s enough to understand the significance of each source and target space, from local to screen space, and to know the sequence of transformations between them. An [overview of relevant coordinate systems](https://math.hws.edu/graphicsbook/c3/s3.html) may also be found in Eck. An [alternative overview](https://learnopengl.com/Getting-started/Coordinate-Systems) may be found in the online book Learn OpenGL, by [Joey de Vries](https://joeydevries.com/#home).

## Prerequisite diagrams

Diagrams covering key concepts in computer graphics are included here, for reference.

### Overview of coordinate systems

<img 
  width="800" 
  height="394" 
  alt="A diagram showing the standard sequence of 3D graphics transforms, from local to world space (via the model matrix), from world to view space (via the view matrix), from view space to clip space (via the projection matrix), and from clip space to screen space (via the viewport transform)."
  src="https://github.com/user-attachments/assets/197931d8-81bc-4b73-ac91-34c7111fa18a" 
/>

*Attribution:* [*coordinate_systems.png*](https://learnopengl.com/img/getting-started/coordinate_systems.png) *by [Joey de Vries](https://x.com/JoeyDeVriez) appears in [Coordinate Systems](https://learnopengl.com/Getting-started/Coordinate-Systems) and is licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)*.

### Normalized device coordinates

<img 
  width="503" 
  height="440" 
  alt = "A cubic space, with a coordinate system whose origin is at the center of the cube. A horizontal axis points right, a vertical axis points up, and a depth axis points away. Values along each axis range between -1 and 1."
  src="https://github.com/user-attachments/assets/ea261f7e-18ed-4141-81fd-3e6de54513ce"
/>

*Attribution:* *Image of NDC space (referred to as “clipspace” in original source) appears in [WebGL model view projection - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection) and is licensed under [CC-BY-SA](https://creativecommons.org/licenses/by-sa/4.0/deed.en).*

### Drawing modes

The image below is sufficient for understanding drawing modes (shape “kinds” in p5.js):

<img 
  width="828" 
  height="517" 
  alt="A diagram illustrating the meaning of each drawing mode available in WebGL, including the following: `gl.POINTS`, `gl.LINES`, `gl.LINE_STRIP`, `gl.LINE_LOOP`, `gl.TRIANGLES`, `gl.TRIANGLE_STRIP`, `gl.TRIANGLE_FAN`."
  src="https://github.com/user-attachments/assets/3cd05534-3f2a-412c-a10e-e29ef8e6bd52" 
/>

*Attribution:* [“*Available WebGL shapes”*](https://miro.medium.com/v2/resize:fit:1100/format:webp/0*HQHB5lCGqlOUiysy.jpg) *appears in [A Brief Introduction to WebGL](https://medium.com/trabe/a-brief-introduction-to-webgl-5b584db3d6d6), by Martín Lamas.*

## Recommended experience

The following background experience is helpful but not necessary:

* Very basic familiarity with typed languages  
* Experience creating graphics with a high-level library like [p5.js](https://p5js.org/) (especially `beginShape([kind])`/`endShape([mode])`)

# Introduction

**Q:** What are the geometric primitives in WebGL?  
**A:** Points, lines, and triangles. (Typically, it’s all triangles.)  
**Source:** [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html), [WebGL2 Points, Lines, and Triangles](https://webgl2fundamentals.org/webgl/lessons/webgl-points-lines-triangles.html), [Geometric primitive - Wikipedia](https://en.wikipedia.org/wiki/Geometric_primitive) 

**Q:** What’s the mathematical term for the simplest n-dimensional shape?  
**A:** Simplex (plural, simplexes or simplices)  
**Note:** A 0-dimensional simplex is a point, a 1-dimensional simplex is a line, and a 2-dimensional simplex is a triangle. (A 3-dimensional simplex is a tetrahedron, which is made up of triangles.)  
**Source:** [Simplex - Wikipedia](https://en.wikipedia.org/wiki/Simplex) 

**Q:** What hardware component does WebGL run on?  
**A:** The GPU (graphics processing unit)  
**Source:** [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html), [Graphics processing unit - Wikipedia](https://en.wikipedia.org/wiki/Graphics_processing_unit)  
   
**Q:** What two pieces of code comprise a WebGL program? Name them.  
**A:** A *vertex shader* and a *fragment shader*.  
**Source:** [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html)

**Q:** Vertex shaders and fragment shaders are code units of what type? (Are they modules, objects, functions, or something else?)  
**A:** They’re functions.  
**Source:** [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html)

**Q:** In WebGL, what language is used to code vertex shaders and fragment shaders?  
**A:** GLSL (OpenGL Shading Language)  
**Note:** More precisely, WebGL uses GLSL ES, which is a bit different.  
**Source:** [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html), [OpenGL Shading Language - Wikipedia](https://en.wikipedia.org/wiki/OpenGL_Shading_Language)

**Q:** What does “OpenGL” stand for?  
**A:** Open Graphics Library  
**Source:** [OpenGL - Wikipedia](https://en.wikipedia.org/wiki/OpenGL)

**Q:** Must variable and function declarations have a declared type in GLSL?  
**A:** Yes.  
**Source:** [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html), [Type system - Wikipedia](https://en.wikipedia.org/wiki/Type_system), [The OpenGL® Shading Language, Version 4.60.8](https://registry.khronos.org/OpenGL/specs/gl/GLSLangSpec.4.60.pdf) (page 26) 

**Q:** What general-purpose language is the syntax of GLSL patterned after?  
**A:** C  
**Source:** [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html), [OpenGL Shading Language - Wikipedia](https://en.wikipedia.org/wiki/OpenGL_Shading_Language#:~:text=OpenGL%20Shading%20Language%20\(GLSL\)%20is,on%20the%20C%20programming%20language) 

**Q:** In computer graphics, what is a vertex?  
**A:**  As in geometry, a vertex is one of a set of points that defines a shape (e.g. the three corners of a triangle). A vertex may have additional attributes for rendering (drawing), such as a color.  
**Source:** [Vertex (computer graphics) - Wikipedia](https://en.wikipedia.org/wiki/Vertex_\(computer_graphics\)), [Vertex (geometry) \- Wikipedia](https://en.wikipedia.org/wiki/Vertex_\(geometry\)) 

**Q:** What does a vertex shader do?  
**A:** It computes vertex positions. (These determine where geometric primitives are rendered on the screen.)  
**Source:** [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html)

**Q:** In computer graphics, what is a pixel?  
**A:** It’s the smallest visual element on a screen. (It’s also known as a “picture element,” analogous to a chemical element in the periodic table). It’s usually a tiny square.  
**Source:** [Pixel \- Wikipedia](https://en.wikipedia.org/wiki/Pixel), [Chemical element \- Wikipedia](https://en.wikipedia.org/wiki/Chemical_element)  

**Q:** What does a fragment shader do?  
**A:** It computes pixel colors. (It does this for each pixel in the primitive being drawn.)  
**Source:** [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html)

**Q:** What software design pattern best describes the behavior of the WebGL context (`gl`)?   
**A:** A State Machine. (You set a state, and it persists until changed).

**Q:** What is a state machine?  
**A:** A mathematical model of computation defined by a list of states, initial values for those states, and the inputs that trigger each transition.  
**Source:** [Finite-state machine on Wikipedia](https://en.wikipedia.org/w/index.php?title=Finite-state_machine&oldid=1323472796)

**Q:** In the DOM, what HTML element provides the drawing surface for WebGL?   
**A:** The `<canvas>` element.

**Q:** How do we access the WebGL2 API?  
**A:** `canvas.getContext('webgl2')`

**Q:** What does `canvas.getContext('webgl2')` return?   
**A:** The `WebGL2RenderingContext`

**Q:** The `WebGL2RenderingContext` is often given what abbreviated name in code?  
**A:** `gl`

**Q:** What is the 2D version of `WebGL2RenderingContext`?  
**A:** `CanvasRenderingContext2D`.

# Hello canvas
It’s time to make our first project! We just need to learn a few additional concepts.

## Colors and buffers

**Q:** What color space is used by the WebGL context?   
**A:** RGBA (red, green, blue, alpha)  
   
**Q:** What is the valid range for color values in WebGL (red, green, blue, and alpha)?   
**A:** `0.0` to `1.0` (floating point numbers).

**Q:** In a WebGL RGBA color, what value of A (alpha) indicates full opacity?  
**A:** `1.0`

**Q:** In a WebGL context, what function sets the canvas color? Include any parameters.  
**A:** `gl.clearColor(r, g, b, a)`

**Q:** What does `gl.clearColor(r, g, b, a)` do?  
**A:** It sets the "clear color" state but does *not* change the colors on the screen.

**Q:** In WebGL, what basic function erases buffers and assigns them preset values? Include any parameters.  
**A:** `gl.clear(mask)`

**Q:** What are the standard buffers that `gl.clear()` can affect?   
**A:** Color, Depth, Stencil

**Q:** When calling `gl.clear()`, what constant do we pass to clear the color buffer?   
**A:** `gl.COLOR_BUFFER_BIT`

**Q:** When calling `gl.clear()`, what constant do we pass to clear the depth buffer?   
**A:** `gl.DEPTH_BUFFER_BIT`

**Q:** Why does `gl.clear()` accept a bitmask as its parameter?   
**A:** To allow multiple buffers to be cleared simultaneously via a bitwise OR operation. (This is an optimization that eliminates the need for multiple function calls.)

**Q:** To clear multiple buffers `buffer1` and `buffer2` simultaneously with `gl.clear()`, what syntax is used?  
**A:** Syntax: `gl.clear(buffer1 | buffer2)`. This uses the bitwise OR operator: `|` (a single pipe character).

## Project 1: Colored canvas
<img width="250" height="250" alt="yellow canvas" src="https://github.com/user-attachments/assets/0498abe0-4899-4204-9549-36e62a7644fa" />

**Problem:**  
Set up an `index.html` file and a JavaScript file. Make a canvas, get the WebGL context, and use it to set the canvas to a color of your choosing.

**Solution:**
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

# Hello triangle
Now we'll work toward getting a triangle on the screen. This will take some work, since we're going to make sure we understand all the low-level boilerplate.

## Starting the data bridge (getting CPU data onto the GPU)

**Q:** In WebGL, what does VBO stand for?  
**A:** Vertex Buffer Object

**Q:** In WebGL, what is the general purpose of a VBO?  
**A:** To store data in the GPU's memory.

**Q:** In WebGL, what sorts of data are commonly stored in a VBO?  
**A:** Vertex attribute data like positions, normals, colors, and texture coordinates.

**Q:** In WebGL, data in a VBO is stored in what data format?  
**A:** Binary

**Q:** In WebGL, what does VAO stand for?  
**A:** Vertex Array Object

**Q:** In WebGL, what is the purpose of a VAO?   
**A:** Recording how to read data from the VBOs. (This is typically vertex-attribute data, hence the name.)

**Q:** In WebGL, what does the term "Binding" mean?   
**A:** Setting an object (e.g. a VBO) as the "active" value for a particular state in the WebGL state machine.

**Q:** In WebGL, what is the order of operations for creating and configuring the VAO and VBO?  
**A:**

1. Create and Bind the VAO.  
2. Create and Bind the VBO.  
3. Upload buffer data.  
4. Configure attributes (tell VAO how to read the VBO).

**Hint:** Since the WebGL context is a state machine, it needs a place to define state (VAO) *before* it can organize the data values (VBO).

**Q:** In WebGL, what syntax creates a Vertex Array Object?  
**A:** `gl.createVertexArray()` (this function does not take parameters)

**Q:** In WebGL, what syntax binds a VAO?  
**A:** `gl.bindVertexArray(vao)`

**Q:** In WebGL, what syntax creates a buffer (VBO)?   
**A:** `gl.createBuffer()` (this function does not take parameters)

**Q:** In WebGL, what syntax binds a buffer?  
**A:** `gl.bindBuffer(target, buffer)`

**Q:** What are the two most common targets for `gl.bindBuffer`?   
**A:** `gl.ARRAY_BUFFER`, `gl.ELEMENT_ARRAY_BUFFER`

**Q:** What kind of data is usually bound to `gl.ARRAY_BUFFER`?  
**A:** Vertex attributes (e.g. position, normal, color, texture data)

**Q:** What kind of data is usually bound to `gl.ELEMENT_ARRAY_BUFFER`?  
**A:** Index data (indicating which vertices to connect)

**Q:** Can you give a concrete example to indicate the purpose of `gl.ELEMENT_ARRAY_BUFFER`?  
**A:** Suppose you want to create a quadrilateral from four vertices. This needs to be created out of triangles, and there are two ways to triangulate a quadrilateral. The element array buffer can be used to specify the triangulation, by indicating which vertices should be connected.

**Q:** What syntax sends data to the currently bound buffer?  
**A:** `gl.bufferData(target, data, usage)`

**Q:** In `gl.bufferData(target, data, usage)`, the `data` argument usually has what type?  
**A:** `Float32Array`

**Q:** In `gl.bufferData`, if the geometry will not change after it is uploaded, what usage constant should be passed?   
**A:** `gl.STATIC_DRAW`

**Q:** In WebGL, an attribute will not be used unless you explicitly turn it on, using what function? Name the function (don’t specify any parameters).  
**A:** `gl.enableVertexAttribArray()`

**Q:** In WebGL, what function tells the VAO how to interpret the data in the currently bound VBO? Name the function (don’t specify any parameters).  
**A:** `gl.vertexAttribPointer()`

## Coordinates expected by WebGL

**Q:** In WebGL, vertex coordinates in a VBO are expected to be in what space? Name the space and indicate the pipeline transform that maps to it.  
**A:** Clip space. It’s the target space of the projection transform.

**Q:** In WebGL, vertex coordinates in clip space are automatically converted to what space, after the vertex shader runs?  
**A:** NDC space (normalized device coordinates). 

**Q:** In WebGL, what operation sends clip space to NDC space?  
**A:** Perspective division: The point (x, y, z, w) is divided by w.

**Q:** In WebGL, what is the range of x, y, and z in NDC space?  
**A:** -1.0 to 1.0.

**Q:** In a WebGL vertex shader, if you define an attribute as a `vec4` but only provide (x, y) data from the buffer, what values are automatically assigned to z and w?   
**A:** `z` = 0.0, `w` = 1.0. (Hint: Recall that a w-coordinate of 1 makes the vertex a point, rather than a direction, i.e. it is affected by translations.)

**Q:** In WebGL Normalized Device Coordinates (NDC), where is the origin (0,0)?   
**A:** The center.

**Q:** In WebGL Normalized Device Coordinates (NDC), in which direction do the x, y, and z axes point?  
**A:** Directions: x points right, y points up, and z points away (directionally, into the screen). (Hint: The xy-plane follows mathematical conventions: x points right and y points up. However, it’s a left handed system.)

**Q:** In WebGL, the depth buffer typically contains values in what range?  
**A:** 0.0 to 1.0 (Hint: These are non-negative, as we’d expect of “depth” values, since “depth” implies a distance measured in only one direction. The depth range may be customized, but this is rarely necessary.)

**Q:** In WebGL, the values in the depth buffer are determined by what transformation? Name it.  
**A:** The viewport transform.

**Q:** In WebGL, what are the source and target spaces of the viewport transform?  
**A:** NDC $\to$ screen space.

**Q:** Conceptually, what does the viewport transform do in WebGL?    
**A:** It stretches NDC space so that its x and y dimensions match those of the canvas, and it converts z-values from NDC space (in $[-1, 1]$) to depth values (in $[0, 1]$ by default).

## Project 2: Set up VBO and VAO, supply triangle data

This project is continued from [Project 1](#project-1-colored-canvas).

**Problem:**  
Extend your `yellow-canvas.js` program so that it defines a triangle as a flat array of three $(x, y)$ vertices. Create and bind a VAO and VBO, and upload the triangle data to the VBO. Assume the triangle data will not change after it’s uploaded. (We won't render the triangle yet. We'll do that in the next project.)

**Solution:**

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

## GLSL ES 3.00 syntax

**Q:** In GLSL, what is the syntax to declare a floating-point variable named `alpha` and initialize it to 1.0?  
**A:** `float alpha = 1.0;`
**Hint:** It is very similar to C or Java. Semicolons are required.

**Q:** In GLSL, `vec2`, `vec3`, and `vec4` refer to vectors whose components have what data type?  
**A:** float (floating point number)

**Q:** In GLSL, a type (such as `vec4`) is also a ____________.  
**A:** constructor

**Q:** In GLSL, how can you create a `vec4` with components $(0.1, 0.2, 0.3, 0.4)$?  
**A:** `vec4(0.1, 0.2, 0.3, 0.4)`

**Q:** In GLSL, if `pos` is a variable of type `vec2`, how do you create a `vec4` using `pos` for the first two components, `0.0` for `z`, and `1.0` for `w`?  
**A:** `vec4(pos, 0.0, 1.0)`

## Shader syntax

**Q:** In a WebGL2 shader source string, what must the very first line be?  
**A:** `#version 300 es`
**Hint:** This refers to GLSL ES 3.00.

**Q:** In a WebGL2 shader, what is wrong with the following code?
```javascript
const shader = `
#version 300 es
// more code here...
`;
```
**A:** There is a newline after the backtick, creating a blank line above the version specification. It should look like this instead:
```javascript
const shader = `#version 300 es
// more code here...
`;
```

**Q:** In GLSL, which shader stage requires an explicit precision declaration?   
**A:** The fragment shader. (Hint: If vertices aren’t in the right place, things go wrong, so high precision is mandated for vertex shaders, but lower precision is allowed for fragment shaders, e.g. to avoid draining battery on older mobile devices.)

**Q:** In a GLSL shader, what’s the syntax to declare that floats should have high precision?  
**A:** `precision highp float;`

**Q:** In a GLSL shader, where does the line of code go that sets the precision of floats?  
**A:** The standard location is at the very top (underneath the line that specifies the GLSL version).

**Q:** In WebGL, a shader begins with the execution of what function? What’s the syntax for it?   
**A:** `void main() {/* code goes here */}` (as the syntax indicates, this function takes no parameters and returns no value)

**Q:** In GLSL, what’s the general syntactical term for the `in` and `out` keywords?  
**A:** They are *storage qualifiers*.

**Q:** What do `in` and `out` storage qualifiers indicate in a vertex shader?  
**A:** `in` = vertex attribute. `out` = data to be interpolated (previously a `varying`).

**Q:** What do `in` and `out` storage qualifiers indicate in a fragment shader?  
**A:** `in` = interpolated data (previously a `varying`). `out` = final fragment color.

**Q:** In GLSL ES 3.00, what is the syntax for setting up a “port” for a shader to receive data?  
**A:** `layout(location = 0) in <type> <variableName>` 

**Q:** In GLSL ES 3.00, what is the meaning of `layout(location = 0)`, in the line `layout(location = 0) in <type> <variableName>`?  
**A:** “Receive data at location 0.”

**Q:** In GLSL ES 3.00, what is the meaning of `<variableName>`, in the line `layout(location = 0) in <type> <variableName>`?  
**A:** This is the name of the variable that contains the data received at location 0.

**Q:** In GLSL ES 3.00, where does the line `layout(location = 0) in <type> <variableName>` go inside a shader?  
**A:** It goes in the global scope of the shader, before `main()`.

**Q:** What special built-in variable must the Vertex Shader write to?  
**A:** `gl_Position`

**Q:** In a GLSL vertex shader, what is the data type of the built-in variable `gl_Position`?  
**A:** `vec4`

**Q:** In GLSL ES 3.00, what is the syntax to define the output color variable in a fragment shader?  
**A:** `out vec4 fragColor;` (You can name the variable whatever you want, but `fragColor` is conventional.)

**Q:** In GLSL ES 3.00, where does the code defining the output color variable in a fragment shader go?  
**A:** It goes in the global scope of the shader, before `main()`.

**Q:** What does the `uniform` storage qualifier indicate?  
**A:** It indicates a variable that is constant per draw call. (It’s global within the shader.)

## Finishing the data bridge (configuring attributes)

**Q:** An attribute will not be used unless it’s explicitly turned on using what syntax?   
**A:** `gl.enableVertexAttribArray(index)`

**Q:** What’s the signature of `gl.vertexAttribPointer()`? (Parameter list and return value.)  
**A:**  
`gl.vertexAttribPointer(index, size, type, normalized, stride, offset)`  
*Return value:*  None ( `undefined`).  
**Hint:** Mentally chunk the parameters into three pairs—`index`, `size`; `type`, `normalized`; `stride`, `offset`.

**Q:** In `gl.vertexAttribPointer()`, what does the `index` parameter represent?   
**A:** The attribute `location` in the vertex shader.

**Q:** In `gl.vertexAttribPointer()`, what does the `size` parameter represent?   
**A:** The number of components per vertex (e.g., `2` for a `vec2`, `3` for a `vec3`).

**Q:** In `gl.vertexAttribPointer()`, what does the `type` parameter represent?   
**A:** The data type of the array components (usually `gl.FLOAT`).

**Q:** In `gl.vertexAttribPointer()`, what does the `normalized` parameter represent?   
**A:** A boolean value indicating whether integer data should be normalized to $\[-1, 1\]$ or $\[0, 1\]$ when converted to a float (has no effect for floats and is typically set to `false` in that case).

**Q:** In `gl.vertexAttribPointer()`, what does the `stride` parameter represent?   
**A:** Byte offset (distance in bytes) between the start of one vertex attribute and the next one of the same type. (Equivalently, the number of bytes used to store attributes corresponding to one vertex  
**Hint:** Imagine attributes are stored like `x0, y0, u0, v0, x1, y1, u1, v1…` The stride tells WebGL that the memory occupied by `x0, y0, u0, v0` corresponds to one vertex.

**Q:** What term do we use to describe attribute data like `x0, y0, u0, v0, x1, y1, u1, v1…` in which attributes of different kinds are stored together in the same buffer?   
**A:** *Interleaved*

**Q:** What term do we use to describe attribute data like `x0, y0, x1, y1,…`  in which attributes in a buffer all have the same kind (e.g. they’re all positions)?  
**A:** *Tightly packed*  
**Hint:** If only positions are represented, then that means there’s zero space between positions (e.g. we don’t have position data, then color data, then position data, etc.).

**Q:** What value do we give `stride` when calling `gl.vertexAttribPointer()`, if we want data to be tightly packed?  
**A:** `0`  
**Hint:** This is a special case: if `0` were the byte offset from the start of one position to the start of the next (for example), that’d mean there’s no position data. So WebGL interprets zero to mean “tightly packed,” (e.g. zero bytes between the *end* of one position and the *start* of the next).

**Q:** If `stride` is set to zero when calling `gl.vertexAttribPointer()`,  how can WebGL determine the byte offset to get from one attribute to the next?  
**A:** WebGL interprets a `stride` of `0` to mean the data is tightly packed (e.g. all position data, with no color data in between). It then automatically calculates the correct byte offset based on the `size` and `type` parameters.

**Q:** When calling `gl.vertexAttribPointer()`, suppose `size` is set to `3`, `type` is set to `gl.FLOAT`, and `stride` is set to zero. WebGL will automatically calculate that the byte offset between attributes is equal to what value?  
**A:** A stride of zero means the data is tightly packed, so we have attributes with three components packed right next to each other. A `gl.FLOAT` consists of 32 bits, which is four bytes (a *byte* is eight bits). So, the byte offset is 3 components \* 4 bytes / component \= 12 bytes.

**Q:** Roughly, when might it be useful to use tightly packed attributes in a WebGL array buffer?  
**A:** Using tightly packed attributes means that all positions would go into one array buffer, all colors would go into another, etc. This can be useful for **dynamic geometry**, e.g. when positions need to be updated but not colors.

**Q:** Roughly, when might it be useful to use interleaved attributes in a WebGL array buffer?  
**A:** This keeps all data for a single vertex close together in memory, which can be more efficient for **static geometry**, e.g. where it’s not necessary to update positions but keep colors the same. (Interleaved attributes also make it possible to deal with just a single buffer.)

**Q:** In `gl.vertexAttribPointer()`, what does the `offset` parameter represent?   
**A:** The byte offset from the start of the buffer to the first component of the first vertex attribute.

**Q:** When `gl.vertexAttribPointer()` is called, how does WebGL know which VBO to read data from?   
**A:** It uses whichever buffer is currently bound to the `gl.ARRAY_BUFFER` target.

**Q:** When `gl.vertexAttribPointer()` is called, it associates data in the active array buffer with what attribute?
**A:** The attribute at the specified `index` (location).

**Q:** What object stores the configuration set by `gl.vertexAttribPointer()` and `gl.enableVertexAttribArray()`? 
**A:** The Vertex Array Object (VAO).

**Q:** Why do we use VAOs instead of just binding VBOs and setting pointers every frame?
**A:** A VAO allows us to store complex attribute setups once and restore them with a single bind call.

## WebGL2 shader compilation

**Q:** In WebGL, what are the high-level steps to setting up a shader object? Answer in words.  
**A:**   
1. *Create*  
2. *Upload* (the GLSL source code)  
3. *Compile*  
4. *Check* (the compile status)   
5. If compiling failed, *Log* (the error) and *Delete* (the shader).

**Q:** In WebGL, what’s the syntax for creating a shader?  
**A:** `gl.createShader(type)`

**Q:** What are the two types of shaders passed to `gl.createShader()`?   
**A:** `gl.VERTEX_SHADER` and `gl.FRAGMENT_SHADER`.

**Q:** In WebGL, what’s the syntax to upload the GLSL source code string to a shader object?   
**A:** `gl.shaderSource(shader, sourceString)`

**Q:** In WebGL, what’s the syntax to compile a shader?  
**A:** `gl.compileShader(shader)`

**Q:** After compiling a shader, what syntax checks if it succeeded?   
**A:** `gl.getShaderParameter(shader, gl.COMPILE_STATUS)`

**Q:** What is the return type of `gl.getShaderParameter(shader, gl.COMPILE_STATUS)`?  
**A:** `Boolean`

**Q:** If `gl.getShaderParameter(shader, gl.COMPILE_STATUS)` indicates an error has occurred, what syntax gets a string with information about the error?  
**A:** Use `gl.getShaderInfoLog(shader)`.

**Q:** In WebGL, why should you delete a shader object after it fails to compile?  
**A:** If it fails to compile, it’s garbage (useless). Deleting it prevents memory leaks (accumulation of useless memory).

**Q:** What function removes a shader object from GPU memory?  
**A:** `gl.deleteShader(shader)`

## WebGL2 program linking

**Q:** In WebGL, what does it mean to “link” a program?  
**A:** Linking a program connects it to dependencies, resulting in a program that’s executable.

**Q:** Regarding executability, what is the difference between a shader object and a program object in WebGL?  
**A:** A *shader* is an intermediate (unlinked) compiled stage. A *program* is linked and ready to run (like an `.exe`).

**Q:** In WebGL, what are the high-level steps to setting up a program object? Answer in words.  
**A:**   
1. *Create*   
2. *Attach* (shaders)   
3. *Link* (program)   
4. *Check* (the link status)   
5. If linking failed, *Log* (error) and *Delete* (the program).

**Q:** In WebGL, what’s the syntax for creating a program object?  
**A:** `gl.createProgram()` (no parameters)

**Q:** In WebGL, what’s the syntax for attaching a shader to a program object?  
**A:** `gl.attachShader(program, shader)` (attaches a vertex or a fragment shader)

**Q:** After attaching shaders to a program, what syntax connects them into a usable executable? 
**A:** `gl.linkProgram(program)`

**Q:** After linking a WebGL program, how do you check if it succeeded?   
**A:** `gl.getProgramParameter(program, gl.LINK_STATUS)` 

**Q:** What is the return type of `gl.getProgramParameter(program, gl.LINK_STATUS)`?  
**A:** `Boolean`

**Q:** If `gl.getProgramParameter(program, gl.LINK_STATUS)` indicates an error has occurred, what syntax gets a string with information about the error?  
**A:** `gl.getProgramInfoLog(program)`

**Q:** In WebGL, why should you delete a program object after it fails to link?  
**A:** If it fails to link, it’s garbage (useless). Deleting it prevents memory leaks (accumulation of useless memory).

**Q:** What function removes a program object from GPU memory?  
**A:** `gl.deleteProgram(program)`

## Drawing

**Q:** In the WebGL2 API, what syntax renders primitives?  
**A:** `gl.drawArrays(mode, first, count)`

**Q:** In the WebGL2 API, what does "arrays" refer to in `gl.drawArrays()`?  
**A:** As it carries out the drawing task, this function aggregates vertex attributes from multiple arrays (e.g. position, color, and texture arrays), assembling all data for vertex 1, then for vertex 2, and so on.

**Q:** In `gl.drawArrays(mode, first, count)`, what are the possible values of the `mode` parameter? Answer with conceptual descriptions.  
**A:** Disconnected points; disconnected lines, an open polyline, or a closed polyline; disconnected triangles, a triangle strip, or a triangle fan.  
**Hint:** The `mode` parameter is analogous to the `kind` parameter in p5's `beginShape(kind)`.

**Q:** In `gl.drawArrays(mode, first, count)`, what are the possible values of the `mode` parameter? Answer with variable names.  
**A:** `gl.POINTS`; `gl.LINES`, `gl.LINE_STRIP`, `gl.LINE_LOOP`; `gl.TRIANGLES`, `gl.TRIANGLE_STRIP`, `gl.TRIANGLE_FAN`.  
**Hint:** The `mode` parameter is analogous to the `kind` parameter in p5's `beginShape(kind)`.

**Q:** In `gl.drawArrays(mode, first, count)`, what does the `first` parameter represent?  
**A:** The starting index to read from, in the arrays of vertex attributes. (Usually 0.)

**Q:** In `gl.drawArrays(mode, first, count)`, what does the `count` parameter represent?  
**A:** The number of vertices to be processed (rendered).

**Q:** Before issuing a `gl.drawArrays` command, what must you tell the GPU, conceptually?  
**A:** You must tell it which shader program to use.

**Q:** What syntax tells `gl.drawArrays` which shader program to execute?  
**A:** `gl.useProgram(program)`  
**Hint:** This tells the WebGL state machine: "For all subsequent draw calls, use this specific compiled executable."

## Project 3: Make boilerplate helper and draw triangle
<img 
  width="250" 
  height="250" 
  alt="yellow canvas with an orange triangle in the center" 
  src="https://github.com/user-attachments/assets/47448258-5800-45aa-8e61-a172ed90d46a" 
/>

**Goal:** Update `yellow-canvas.js` to render your existing triangle geometry in orange, on top of the yellow background.

**Context:** From [Project 2](#project-2-set-up-vbo-and-vao-supply-triangle-data), you already have the geometry (a `Float32Array` of 2D coordinates) in a VBO, and a VAO that is currently bound. Now you need to build the program to process that data.

**Project Specifications:**

1. **Helper Function:** Create a function `createProgram(gl, vsSource, fsSource)` at the bottom of your file.  
   * It must create two shaders and one program.  
   * It must compile the shaders and check their compile status.  
   * It must link the program and check its link status.  
   * **Constraint:** If any check fails, log the error and **delete** the faulty object to avoid memory leaks. Return `null` if it fails, or the `program` if it succeeds.  
2. **Shader Source Code:** Define two template strings, `vsSource` and `fsSource`.  
   * **Vertex Shader:**  
     * Accept an attribute `position` at location 0. Note that your buffer has 2 numbers per vertex, so this should be a `vec2`.  
     * Output a `gl_Position`. (Hint: You will need to convert your `vec2` input.)
   * **Fragment Shader:**  
     * Declare the variable to output.   
     * Output the color orange: `vec4(1.0, 0.4, 0.0, 1.0)`.
3. **Execution:**  
   * Call your helper to create the program.  
   * Tell WebGL to use this program.  
   * Draw the triangle.
  
**Solution:**
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
