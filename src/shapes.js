/*
 * ORIGINAL SOURCE: p5.js (https://p5js.org/)
 * Copyright (c) 2013-2025 The Processing Foundation
 * 
 * * LICENSE: 
 *   LGPL-2.1 (https://www.gnu.org/licenses/old-licenses/lgpl-2.1.en.html)
 *
 * * PROVENANCE:
 *   https://github.com/processing/p5.js/blob/89ca980be30dca2b9deef18c7021b60b227fa264/src/shape/custom_shapes.js
 * 
 * * MODIFICATION DATE:
 *   Modified by Greg Stanton on December 14, 2025.
 * 
 * * MODIFICATIONS:
 *   Removed all features except those required for a WebGL implementation of the following:
 *    - paths (specifically polylines, Béziers, and splines) 
 *    - triangle strips
 * 
 *   (Some inline docs may still refer to other primitives like triangle fans,
 *   so that the full API context is still clear.)
 *   
 *   Removed outdated or unnecessary code comments and docs, and p5-specific boilerplate 
 *   (`p5.` prefixes, add-on registration).
 * 
 *   Added support for `SWEEP` shapes.
 *   
 *   The features retained in this file pass data to a `Shape` instance via
 *   `beginShape()`/`endShape()`.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 */

/**
 * @module Shapes
 * @requires Color
 * @requires Vector
 * @requires constants
 */

import { Color } from './Color.js';
import { Vector } from './Vector.js';
import * as constants from './constants.js';

// ---- UTILITY FUNCTIONS ----
function polylineLength(vertices) {
  let length = 0;
  for (let i = 1; i < vertices.length; i++) {
    length += vertices[i-1].position.dist(vertices[i].position);
  }
  return length;
}

// ---- GENERAL BUILDING BLOCKS ----

/**
 * @private
 * A class to describe a vertex (a point on a shape), in 2D or 3D.
 *
 * Vertices are the basic building blocks of all `p5.Shape` objects, including
 * shapes made with `vertex()`, `arcVertex()`, `bezierVertex()`, and `splineVertex()`.
 *
 * Like a point on an object in the real world, a vertex may have different properties.
 * These may include coordinate properties such as `position`, `textureCoordinates`, and `normal`,
 * color properties such as `fill` and `stroke`, and more.
 *
 * A vertex called `myVertex` with position coordinates `(2, 3, 5)` and a green stroke may be 
 * created like this:
 *
 * ```js
 * let myVertex = new p5.Vertex({
 *   position: createVector(2, 3, 5),
 *   stroke: color('green')
 * });
 * ```
 *
 * Any property names may be used. The `Shape` class assumes that if a vertex has a
 * position or texture coordinates, they are stored in `position` and `textureCoordinates`
 * properties.
 *
 * Property values may be any
 * <a href="https://developer.mozilla.org/en-US/docs/Glossary/Primitive">JavaScript primitive</a>, any
 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer">object literal</a>,
 * or any object with an `array` property.
 *
 * For example, if a position is stored as a `Vector` object and a stroke is stored as a `Color` object,
 * then the `array` properties of those objects will be used by the vertex's own `array` property, which provides
 * all the vertex data in a single array.
 *
 * @class Vertex
 * @param {Object} [properties={position: createVector(0, 0)}] vertex properties.
 */

class Vertex {
  constructor(properties) {
    for (const [key, value] of Object.entries(properties)) {
      this[key] = value;
    }
  }
}

/**
 * @private
 * A base class to describe a shape primitive (a basic shape drawn with
 * `beginShape()`/`endShape()`).
 *
 * Shape primitives are the most basic shapes that can be drawn with
 * `beginShape()`/`endShape()`:
 *
 * - segment primitives: line segments, bezier segments, spline segments, and arc segments
 * - isolated primitives: points, lines, triangles, and quads
 * - tessellation primitives: triangle fans, triangle strips, and quad strips
 *
 * More complex shapes may be created by combining many primitives, possibly of different kinds,
 * into a single shape.
 *
 * In a similar way, every shape primitive is built from one or more vertices.
 * For example, a point consists of a single vertex, while a triangle consists of three vertices.
 * Each type of shape primitive has a `vertexCapacity`, which may be `Infinity` (for example, a
 * spline may consist of any number of vertices). A primitive's `vertexCount` is the number of
 * vertices it currently contains.
 *
 * Each primitive can add itself to a shape with an `addToShape()` method.
 *
 * It can also accept visitor objects with an `accept()` method. When a primitive accepts a visitor,
 * it gives the visitor access to its vertex data. For example, one visitor to a segment might turn
 * the data into 2D drawing instructions. Another might find a point at a given distance
 * along the segment.
 *
 * @class ShapePrimitive
 * @abstract
 */

class ShapePrimitive {
  vertices;
  _shape = null;
  _primitivesIndex = null;
  _contoursIndex = null;
  isClosing = false;

  constructor(...vertices) {
    if (this.constructor === ShapePrimitive) {
      throw new Error('ShapePrimitive is an abstract class: it cannot be instantiated.');
    }
    if (vertices.length > 0) {
      this.vertices = vertices;
    }
    else {
      throw new Error('At least one vertex must be passed to the constructor.');
    }
  }

  get vertexCount() {
    return this.vertices.length;
  }

  get vertexCapacity() {
    throw new Error('Getter vertexCapacity must be implemented.');
  }

  get _firstInterpolatedVertex() {
    return this.startVertex();
  }

  get canOverrideAnchor() {
    return false;
  }

  accept(visitor) {
    throw new Error('Method accept() must be implemented.');
  }

  addToShape(shape) {
    let lastContour = shape.at(-1);

    if (lastContour.primitives.length === 0) {
      lastContour.primitives.push(this);
    } else {
      // last primitive in shape
      let lastPrimitive = shape.at(-1, -1);
      let hasSameType = lastPrimitive instanceof this.constructor;
      let spareCapacity = lastPrimitive.vertexCapacity -
                          lastPrimitive.vertexCount;

      // this primitive
      let pushableVertices;
      let remainingVertices;

      if (hasSameType && spareCapacity > 0) {

        pushableVertices = this.vertices.splice(0, spareCapacity);
        remainingVertices = this.vertices;
        lastPrimitive.vertices.push(...pushableVertices);

        if (remainingVertices.length > 0) {
          lastContour.primitives.push(this);
        }
      }
      else {
        lastContour.primitives.push(this);
      }
    }

    // if primitive itself was added
    // (i.e. its individual vertices weren't all added to an existing primitive)
    // give it a reference to the shape and store its location within the shape
    let addedToShape = this.vertices.length > 0;
    if (addedToShape) {
      let lastContour = shape.at(-1);
      this._primitivesIndex = lastContour.primitives.length - 1;
      this._contoursIndex = shape.contours.length - 1;
      this._shape = shape;
    }

    return shape.at(-1, -1);
  }

  get _nextPrimitive() {
    return this._belongsToShape ?
      this._shape.at(this._contoursIndex, this._primitivesIndex + 1) :
      null;
  }

  get _belongsToShape() {
    return this._shape !== null;
  }

  handlesClose() {
    return false;
  }

  close(vertex) {
    throw new Error('Unimplemented!');
  }
}

/**
 * @private
 * A class to describe a contour made with `beginContour()`/`endContour()`.
 *
 * Contours may be thought of as shapes inside of other shapes.
 * For example, a contour may be used to create a hole in a shape that is created
 * with `beginShape()`/`endShape()`.
 * Multiple contours may be included inside a single shape.
 *
 * Contours can have any `kind` that a shape can have:
 *
 * - `PATH`
 * - `POINTS`
 * - `LINES`
 * - `TRIANGLES`
 * - `QUADS`
 * - `TRIANGLE_FAN`
 * - `TRIANGLE_STRIP`
 * - `QUAD_STRIP`
 * - `SWEEP`
 *
 * By default, a contour has the same kind as the shape that contains it, but this
 * may be changed by passing a different `kind` to `beginContour()`.
 *
 * A `Contour` of any kind consists of `primitives`, which are the most basic
 * shapes that can be drawn. For example, if a contour is a hexagon, then
 * it's made from six line-segment primitives.
 *
 * @class Contour
 */

class Contour {
  #kind;
  primitives;

  constructor(kind = constants.PATH) {
    this.#kind = kind;
    this.primitives = [];
  }

  get kind() {
    const isEmpty = this.primitives.length === 0;
    const isPath = this.#kind === constants.PATH;
    return isEmpty && isPath ? constants.EMPTY_PATH : this.#kind;
  }

  accept(visitor) {
    for (const primitive of this.primitives) {
      primitive.accept(visitor);
    }
  }
}

// ---- PATH PRIMITIVES ----

/**
 * @private
 * A class responsible for...
 *
 * @class Anchor
 * @extends ShapePrimitive
 * @param {Vertex} vertex the vertex to include in the anchor.
 */

class Anchor extends ShapePrimitive {
  #vertexCapacity = 1;

  get vertexCapacity() {
    return this.#vertexCapacity;
  }

  accept(visitor) {
    visitor.visitAnchor(this);
  }

  getEndVertex() {
    return this.vertices[0];
  }
}

/**
* @private
* A class responsible for...
*
* Note: When a segment is added to a shape, it's attached to an anchor or another segment.
* Adding it to another shape may result in unexpected behavior.
*
* @class Segment
* @abstract
* @extends ShapePrimitive
* @param {...Vertex} vertices the vertices to include in the segment.
*/

class Segment extends ShapePrimitive {
  constructor(...vertices) {
    super(...vertices);
    if (this.constructor === Segment) {
      throw new Error('Segment is an abstract class: it cannot be instantiated.');
    }
  }

  // segments in a shape always have a predecessor
  // (either an anchor or another segment)
  get _previousPrimitive() {
    return this._belongsToShape ?
      this._shape.at(this._contoursIndex, this._primitivesIndex - 1) :
      null;
  }

  getStartVertex() {
    return this._previousPrimitive.getEndVertex();
  }

  getEndVertex() {
    return this.vertices.at(-1);
  }
}

/**
 * @private
 * A class responsible for...
 *
 * @class LineSegment
 * @param {Vertex} vertex the vertex to include in the anchor.
 */


class LineSegment extends Segment {
  #vertexCapacity = 1;

  get vertexCapacity() {
    return this.#vertexCapacity;
  }

  accept(visitor) {
    visitor.visitLineSegment(this);
  }
}

class BezierSegment extends Segment {
  #order;
  #vertexCapacity;

  constructor(order, ...vertices) {
    super(...vertices);

    // Order m may sometimes be passed as an array [m], since arrays
    // may be used elsewhere to store order of
    // Bezier curves and surfaces in a common format

    let numericalOrder = Array.isArray(order) ? order[0] : order;
    this.#order = numericalOrder;
    this.#vertexCapacity = numericalOrder;
  }

  get order() {
    return this.#order;
  }

  get vertexCapacity() {
    return this.#vertexCapacity;
  }

  #_hullLength;
  hullLength() {
    if (this.#_hullLength === undefined) {
      this.#_hullLength = polylineLength([
        this.getStartVertex(),
        ...this.vertices
      ]);
    }
    return this.#_hullLength;
  }

  accept(visitor) {
    visitor.visitBezierSegment(this);
  }
}

class SplineSegment extends Segment {
  #vertexCapacity = Infinity;
  _splineProperties = {
    ends: constants.INCLUDE,
    tightness: 0
  };

  get vertexCapacity() {
    return this.#vertexCapacity;
  }

  accept(visitor) {
    visitor.visitSplineSegment(this);
  }

  get _comesAfterSegment() {
    return this._previousPrimitive instanceof Segment;
  }

  get canOverrideAnchor() {
    return this._splineProperties.ends === constants.EXCLUDE;
  }

  get _firstInterpolatedVertex() {
    if (this._splineProperties.ends === constants.EXCLUDE) {
      return this._comesAfterSegment ?
        this.vertices[1] :
        this.vertices[0];
    } else {
      return this.getStartVertex()
    }
  }

  get _chainedToSegment() {
    if (this._belongsToShape && this._comesAfterSegment) {
      let interpolatedStartPosition = this._firstInterpolatedVertex.position;
      let predecessorEndPosition = this.getStartVertex().position;
      return predecessorEndPosition.equals(interpolatedStartPosition);
    }
    else {
      return false;
    }
  }

  // extend addToShape() with a warning
  addToShape(shape) {
    const added = super.addToShape(shape);
    this._splineProperties.ends = shape._splineProperties.ends;
    this._splineProperties.tightness = shape._splineProperties.tightness;

    if (this._splineProperties.ends !== constants.EXCLUDE) return added;

    let verticesPushed = !this._belongsToShape;
    let lastPrimitive = shape.at(-1, -1);

    let message = (array1, array2) =>
      `Spline does not start where previous path segment ends:
      second spline vertex at (${array1})
      expected to be at (${array2}).`;

    if (verticesPushed &&
      // Only check once the first interpolated vertex has been added
      lastPrimitive.vertices.length === 2 &&
      lastPrimitive._comesAfterSegment &&
      !lastPrimitive._chainedToSegment
    ) {
      let interpolatedStart = lastPrimitive._firstInterpolatedVertex.position;
      let predecessorEnd = lastPrimitive.getStartVertex().position;

      console.warn(
        message(interpolatedStart.array(), predecessorEnd.array())
      );
    }

    // TODO: Consider case where positions match but other vertex properties don't.
    return added;
  }

  // override method on base class
  getEndVertex() {
    if (this._splineProperties.ends === constants.INCLUDE) {
      return super.getEndVertex();
    } else if (this._splineProperties.ends === constants.EXCLUDE) {
      return this.vertices.at(-2);
    } else {
      return this.getStartVertex();
    }
  }

  getControlPoints() {
    let points = [];

    if (this._comesAfterSegment) {
      points.push(this.getStartVertex());
    }
    points.push(this.getStartVertex());

    for (const vertex of this.vertices) {
      points.push(vertex);
    }

    const prevVertex = this.getStartVertex();
    if (this._splineProperties.ends === constants.INCLUDE) {
      points.unshift(prevVertex);
      points.push(this.vertices.at(-1));
    } else if (this._splineProperties.ends === constants.JOIN) {
      points.unshift(this.vertices.at(-1));
      points.push(prevVertex, this.vertices.at(0));
    }

    return points;
  }

  handlesClose() {
    if (!this._belongsToShape) return false;

    // Only handle closing if the spline is the only thing in its contour after
    // the anchor
    const contour = this._shape.at(this._contoursIndex);
    return contour.primitives.length === 2 && this._primitivesIndex === 1;
  }

  close() {
    this._splineProperties.ends = constants.JOIN;
  }
}

// ---- TESSELLATION PRIMITIVES ----

class TriangleStrip extends ShapePrimitive {
  #vertexCapacity = Infinity;

  get vertexCapacity() {
    return this.#vertexCapacity;
  }

  accept(visitor) {
    visitor.visitTriangleStrip(this);
  }
}

// ---- PRIMITIVE SHAPE CREATORS ----

class PrimitiveShapeCreators {
  creators;

  constructor() {
    let creators = new Map();

    // vertex
    creators.set(`vertex-${constants.EMPTY_PATH}`, (...vertices) => new Anchor(...vertices));
    creators.set(`vertex-${constants.PATH}`, (...vertices) => new LineSegment(...vertices));
    creators.set(`vertex-${constants.TRIANGLE_STRIP}`, (...vertices) => new TriangleStrip(...vertices));

    // bezierVertex (constructors all take order and vertices so they can be called in a uniform way)
    creators.set(`bezierVertex-${constants.EMPTY_PATH}`, (order, ...vertices) => new Anchor(...vertices));
    creators.set(`bezierVertex-${constants.PATH}`, (order, ...vertices) => new BezierSegment(order, ...vertices));

    // splineVertex
    creators.set(`splineVertex-${constants.EMPTY_PATH}`, (...vertices) => new Anchor(...vertices));
    creators.set(`splineVertex-${constants.PATH}`, (...vertices) => new SplineSegment(...vertices));

    this.creators = creators;
  }

  get(vertexKind, shapeKind) {
    const key = `${vertexKind}-${shapeKind}`;
    return this.creators.get(key);
  }

  set(vertexKind, shapeKind, creator) {
    const key = `${vertexKind}-${shapeKind}`;
    this.creators.set(key, creator);
  }

  clear() {
    this.creators.clear();
  }
}

// ---- SHAPE ----

/* Note: It's assumed that Shape instances are always built through
 * their beginShape()/endShape() methods. For example, this ensures
 * that a segment is never the first primitive in a contour (paths
 * always start with an anchor), which simplifies code elsewhere.
 */

/**
 * @private
 * A class to describe a custom shape made with `beginShape()`/`endShape()`.
 *
 * Every `Shape` has a `kind`. The kind takes any value that
 * can be passed to `beginShape()`:
 *
 * - `PATH`
 * - `POINTS`
 * - `LINES`
 * - `TRIANGLES`
 * - `QUADS`
 * - `TRIANGLE_FAN`
 * - `TRIANGLE_STRIP`
 * - `QUAD_STRIP`
 * - `SWEEP`
 *
 * A `Shape` of any kind consists of `contours`, which can be thought of as
 * subshapes (shapes inside another shape). Each `contour` is built from
 * basic shapes called primitives, and each primitive consists of one or more vertices.
 *
 * For example, a square can be made from a single path contour with four line-segment
 * primitives. Each line segment contains a vertex that indicates its endpoint. A square
 * with a circular hole in it contains the circle in a separate contour.
 *
 * By default, each vertex only has a position, but a shape's vertices may have other
 * properties such as texture coordinates, a normal vector, a fill color, and a stroke color.
 * The properties every vertex should have may be customized by passing `vertexProperties` to
 * `createShape()`.
 *
 * Once a shape is created and given a name like `myShape`, it can be built up with
 * methods such as `myShape.beginShape()`, `myShape.vertex()`, and `myShape.endShape()`.
 *
 * Vertex functions such as `vertex()` or `bezierVertex()` are used to set the `position`
 * property of vertices, as well as the `textureCoordinates` property if applicable. Those
 * properties only apply to a single vertex.
 *
 * If `vertexProperties` includes other properties, they are each set by a method of the
 * same name. For example, if vertices in `myShape` have a `fill`, then that is set with
 * `myShape.fill()`. In the same way that a `fill()` may be applied
 * to one or more shapes, `myShape.fill()` may be applied to one or more vertices.
 *
 * @class Shape
 * @param {Object} [vertexProperties={position: createVector(0, 0)}] vertex properties and their initial values.
 */

class Shape {
  #vertexProperties;
  #initialVertexProperties;
  #primitiveShapeCreators;
  #bezierOrder = 3;
  kind = null;
  contours = [];
  _splineProperties = {
    tightness: 0,
    ends: constants.INCLUDE
  };
  userVertexProperties = null;

  constructor(
    vertexProperties,
    primitiveShapeCreators = new PrimitiveShapeCreators()
  ) {
    this.#initialVertexProperties = vertexProperties;
    this.#vertexProperties = vertexProperties;
    this.#primitiveShapeCreators = primitiveShapeCreators;

    for (const key in this.#vertexProperties) {
      if (key !== 'position' && key !== 'textureCoordinates') {
        this[key] = function(value) {
          this.#vertexProperties[key] = value;
        };
      }
    }
  }

  serializeToArray(val) {
    if (val === null || val === undefined) {
      return [];
    } if (val instanceof Number) {
      return [val];
    } else if (val instanceof Array) {
      return val;
    } else if (val.array instanceof Function) {
      return val.array();
    } else {
      throw new Error(`Can't convert ${val} to array!`);
    }
  }

  vertexToArray(vertex) {
    const array = [];
    for (const key in this.#vertexProperties) {
      if (this.userVertexProperties && key in this.userVertexProperties)
        continue;
      const val = vertex[key];
      array.push(...this.serializeToArray(val));
    }
    for (const key in this.userVertexProperties) {
      if (key in vertex) {
        array.push(...this.serializeToArray(vertex[key]));
      } else {
        array.push(...new Array(this.userVertexProperties[key]).fill(0));
      }
    }
    return array;
  }

  hydrateValue(queue, original) {
    if (original === null) {
      return null;
    } else if (original instanceof Number) {
      return queue.shift();
    } else if (original instanceof Array) {
      const array = [];
      for (let i = 0; i < original.length; i++) {
        array.push(queue.shift());
      }
      return array;
    } else if (original instanceof Vector) {
      return new Vector(queue.shift(), queue.shift(), queue.shift());
    } else if (original instanceof Color) {
      const array = [
        queue.shift(),
        queue.shift(),
        queue.shift(),
        queue.shift()
      ];
      return new Color(array);
    }
  }

  arrayToVertex(array) {
    const vertex = {};
    const queue = [...array];

    for (const key in this.#vertexProperties) {
      if (this.userVertexProperties && key in this.userVertexProperties)
        continue;
      const original = this.#vertexProperties[key];
      vertex[key] = this.hydrateValue(queue, original);
    }
    for (const key in this.userVertexProperties) {
      const original = this.#vertexProperties[key];
      vertex[key] = this.hydrateValue(queue, original);
    }
    return vertex;
  }

  arrayScale(array, scale) {
    return array.map(v => v * scale);
  }

  arraySum(first, ...rest) {
    return first.map((v, i) => {
      let result = v;
      for (let j = 0; j < rest.length; j++) {
        result += rest[j][i];
      }
      return result;
    });
  }

  arrayMinus(a, b) {
    return a.map((v, i) => v - b[i]);
  }

  evaluateCubicBezier([a, b, c, d], t) {
    return this.arraySum(
      this.arrayScale(a, Math.pow(1 - t, 3)),
      this.arrayScale(b, 3 * Math.pow(1 - t, 2) * t),
      this.arrayScale(c, 3 * (1 - t) * Math.pow(t, 2)),
      this.arrayScale(d, Math.pow(t, 3))
    );
  }

  evaluateQuadraticBezier([a, b, c], t) {
    return this.arraySum(
      this.arrayScale(a, Math.pow(1 - t, 2)),
      this.arrayScale(b, 2 * (1 - t) * t),
      this.arrayScale(c, t * t)
    );
  }

  /*
  catmullRomToBezier(vertices, tightness)

  Abbreviated description:
  Converts a Catmull-Rom spline to a sequence of Bezier curveTo points.

  Parameters:
  vertices -> Array [v0, v1, v2, v3, ...] of at least four vertices
  tightness -> Number affecting shape of curve

  Returns:
  array of Bezier curveTo control points, each represented as [c1, c2, c3][]
  */
  catmullRomToBezier(vertices, tightness) {
    let s = 1 - tightness;
    let bezArrays = [];

    for (let i = 0; i + 3 < vertices.length; i++) {
      const [a, b, c, d] = vertices.slice(i, i + 4);
      const bezB = this.arraySum(
        b,
        this.arrayScale(this.arrayMinus(c, a), s / 6)
      );
      const bezC = this.arraySum(
        c,
        this.arrayScale(this.arrayMinus(b, d), s / 6)
      );
      const bezD = c;

      bezArrays.push([bezB, bezC, bezD]);
    }
    return bezArrays;
  }

  // RENAME at()?
  // -at() indicates it works like Array.prototype.at(), e.g. with negative indices
  // -get() may work better if we want to add a corresponding set() method
  // -a set() method could maybe check for problematic usage (e.g. inserting a Triangle into a PATH)
  // -renaming or removing would necessitate changes at call sites (it's already in use)

  at(contoursIndex, primitivesIndex, verticesIndex) {
    let contour;
    let primitive;

    contour = this.contours.at(contoursIndex);

    switch(arguments.length) {
      case 1:
        return contour;
      case 2:
        return contour.primitives.at(primitivesIndex);
      case 3:
        primitive = contour.primitives.at(primitivesIndex);
        return primitive.vertices.at(verticesIndex);
    }
  }

  // maybe call this clear() for consistency with PrimitiveShapeCreators.clear()?
  reset() {
    this.#vertexProperties = { ...this.#initialVertexProperties };
    this.kind = null;
    this.contours = [];
    this.userVertexProperties = null;
  }

  vertexProperty(name, data) {
    this.userVertexProperties = this.userVertexProperties || {};
    const key = this.vertexPropertyKey(name);

    const dataArray = Array.isArray(data) ? data : [data];

    if (!this.userVertexProperties[key]) {
      this.userVertexProperties[key] = dataArray.length;
    }
    this.#vertexProperties[key] = dataArray;
}
  vertexPropertyName(key) {
    return key.replace(/Src$/, '');
  }
  vertexPropertyKey(name) {
    return name + 'Src';
  }

  /*
  Note: Internally, #bezierOrder is stored as an array, in order to accommodate
  primitives including Bezier segments, Bezier triangles, and Bezier quads. For example,
  a segment may have #bezierOrder [m], whereas a quad may have #bezierOrder [m, n].
   */

  bezierOrder(...order) {
    this.#bezierOrder = order;
  }

  splineProperty(key, value) {
    this._splineProperties[key] = value;
  }

  splineProperties(values) {
    if (values) {
      for (const key in values) {
        this.splineProperty(key, values[key]);
      }
    } else {
      return this._splineProperties;
    }
  }

  /*
  To-do: Maybe refactor #createVertex() since this has side effects that aren't advertised
  in the method name?
  */
  #createVertex(position, textureCoordinates) {
    this.#vertexProperties.position = position;

    if (textureCoordinates !== undefined) {
      this.#vertexProperties.textureCoordinates = textureCoordinates;
    }

    return new Vertex(this.#vertexProperties);
  }

  #createPrimitiveShape(vertexKind, shapeKind, ...vertices) {
    let primitiveShapeCreator = this.#primitiveShapeCreators.get(
      vertexKind, shapeKind
    );

    return  vertexKind === 'bezierVertex' ?
      primitiveShapeCreator(this.#bezierOrder, ...vertices) :
      primitiveShapeCreator(...vertices);
  }

  /*
    #generalVertex() is reused by the special vertex functions,
    including vertex(), bezierVertex(), splineVertex():

    It creates a vertex, builds a primitive including that
    vertex, and has the primitive add itself to the shape.
  */
  #generalVertex(kind, position, textureCoordinates) {
    let vertexKind = kind;
    let lastContourKind = this.at(-1).kind;
    let vertex = this.#createVertex(position, textureCoordinates);

    let primitiveShape = this.#createPrimitiveShape(
      vertexKind,
      lastContourKind,
      vertex
    );

    return primitiveShape.addToShape(this);
  }

  vertex(position, textureCoordinates, { isClosing = false } = {}) {
    const added = this.#generalVertex('vertex', position, textureCoordinates);
    added.isClosing = isClosing;
  }

  bezierVertex(position, textureCoordinates) {
    this.#generalVertex('bezierVertex', position, textureCoordinates);
  }

  splineVertex(position, textureCoordinates) {
    this.#generalVertex('splineVertex', position, textureCoordinates);
  }

  beginContour(shapeKind = constants.PATH) {
    if (this.at(-1)?.kind === constants.EMPTY_PATH) {
      this.contours.pop();
    }
    this.contours.push(new Contour(shapeKind));
  }

  endContour(closeMode = constants.OPEN, _index = this.contours.length - 1) {
    const contour = this.at(_index);
    if (closeMode === constants.CLOSE) {
      // shape characteristics
      const isPath = contour.kind === constants.PATH;

      // anchor characteristics
      const anchorVertex = this.at(_index, 0, 0);
      const anchorHasPosition = Object.hasOwn(anchorVertex, 'position');
      const lastSegment = this.at(_index, -1);

      // close path
      if (isPath && anchorHasPosition) {
        if (lastSegment.handlesClose()) {
          lastSegment.close(anchorVertex);
        } else {
          // Temporarily remove contours after the current one so that we add to the original
          // contour again
          const rest = this.contours.splice(
            _index + 1,
            this.contours.length - _index - 1
          );
          const prevVertexProperties = this.#vertexProperties;
          this.#vertexProperties = { ...prevVertexProperties };
          for (const key in anchorVertex) {
            if (['position', 'textureCoordinates'].includes(key)) continue;
            this.#vertexProperties[key] = anchorVertex[key];
          }
          this.vertex(
            anchorVertex.position,
            anchorVertex.textureCoordinates,
            { isClosing: true }
          );
          this.#vertexProperties = prevVertexProperties;
          this.contours.push(...rest);
        }
      }
    }
  }

  beginShape(shapeKind = constants.PATH) {
    this.kind = shapeKind;
    // Implicitly start a contour
    this.beginContour(shapeKind);
  }
  /* TO-DO:
     Refactor?
     - Might not need anchorHasPosition.
     - Might combine conditions at top, and rely on shortcircuiting.
     Does nothing if shape is not a path or has multiple contours. Might discuss this.
  */
  endShape(closeMode = constants.OPEN) {
    if (closeMode === constants.CLOSE) {
      // Close the first contour, the one implicitly used for shape data
      // added without an explicit contour
      this.endContour(closeMode, 0);
    }
  }

  accept(visitor) {
    for (const contour of this.contours) {
      contour.accept(visitor);
    }
  }
}

// ---- PRIMITIVE VISITORS ----

// abstract class
class PrimitiveVisitor {
  constructor() {
    if (this.constructor === PrimitiveVisitor) {
      throw new Error('PrimitiveVisitor is an abstract class: it cannot be instantiated.');
    }
  }
  // path primitives
  visitAnchor(anchor) {
    throw new Error('Method visitAnchor() has not been implemented.');
  }
  visitLineSegment(lineSegment) {
    throw new Error('Method visitLineSegment() has not been implemented.');
  }
  visitBezierSegment(bezierSegment) {
    throw new Error('Method visitBezierSegment() has not been implemented.');
  }
  visitSplineSegment(curveSegment) {
    throw new Error('Method visitSplineSegment() has not been implemented.');
  }

  // tessellation primitives
  visitTriangleStrip(triangleStrip) {
    throw new Error('Method visitTriangleStrip() has not been implemented.');
  }
}

class PrimitiveToVerticesConverter extends PrimitiveVisitor {
  contours = [];
  curveDetail;

  constructor({ curveDetail = 1 } = {}) {
    super();
    this.curveDetail = curveDetail;
  }

  lastContour() {
    return this.contours[this.contours.length - 1];
  }

  visitAnchor(anchor) {
    this.contours.push([]);
    // Weird edge case: if the next segment is a spline, we might
    // need to jump to a different vertex.
    const next = anchor._nextPrimitive;
    if (next?.canOverrideAnchor) {
      this.lastContour().push(next._firstInterpolatedVertex);
    } else {
      this.lastContour().push(anchor.getEndVertex());
    }
  }
  visitLineSegment(lineSegment) {
    this.lastContour().push(lineSegment.getEndVertex());
  }
  visitBezierSegment(bezierSegment) {
    const contour = this.lastContour();
    const numPoints = Math.max(
      1,
      Math.ceil(bezierSegment.hullLength() * this.curveDetail)
    );
    const vertexArrays = [
      bezierSegment.getStartVertex(),
      ...bezierSegment.vertices
    ].map(v => bezierSegment._shape.vertexToArray(v));
    for (let i = 0; i < numPoints; i++) {
      const t = (i + 1) / numPoints;
      contour.push(
        bezierSegment._shape.arrayToVertex(
          bezierSegment.order === 3
            ? bezierSegment._shape.evaluateCubicBezier(vertexArrays, t)
            : bezierSegment._shape.evaluateQuadraticBezier(vertexArrays, t)
        )
      );
    }
  }
  visitSplineSegment(splineSegment) {
    const shape = splineSegment._shape;
    const contour = this.lastContour();

    const arrayVertices = splineSegment.getControlPoints().map(
      v => shape.vertexToArray(v)
    );
    let bezierArrays = shape.catmullRomToBezier(
      arrayVertices,
      splineSegment._splineProperties.tightness
    );
    let startVertex = shape.vertexToArray(splineSegment._firstInterpolatedVertex);
    for (const array of bezierArrays) {
      const bezierControls = [startVertex, ...array];
      const numPoints = Math.max(
        1,
        Math.ceil(
          polylineLength(bezierControls.map(v => shape.arrayToVertex(v))) *
          this.curveDetail
        )
      );
      for (let i = 0; i < numPoints; i++) {
        const t = (i + 1) / numPoints;
        contour.push(
          shape.arrayToVertex(shape.evaluateCubicBezier(bezierControls, t))
        );
      }
      startVertex = array[2];
    }
  }
  visitTriangleStrip(triangleStrip) {
    // WebGL itself interprets the vertices as a strip, no reformatting needed
    this.contours.push(triangleStrip.vertices.slice());
  }
}

class PointAtLengthGetter extends PrimitiveVisitor {
  constructor() {
    super();
  }

  /* TODO:
  State: 
   1. Total length.
   2. Lookup Table (LUT).

  Methods:
   1. visitAnchor: Start a new segment (length = 0).
   2. visitLineSegment: Implement as you'd expect.
   3. visitBezierSegment: Inject numerical integration method (Simpson's Rule for now), populate the LUT, ...
   3. visitSplineSegment: Reuse Bezier functionality.
  */

}

export {
  Shape,
  Contour,
  ShapePrimitive,
  Vertex,
  Anchor,
  Segment,
  LineSegment,
  BezierSegment,
  SplineSegment,
  TriangleStrip,
  PrimitiveVisitor,
  PrimitiveToVerticesConverter,
  PointAtLengthGetter
};