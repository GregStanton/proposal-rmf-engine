/**
 * @module Vector
 * @requires constants
 */

import * as constants from './constants.js';

/**
 * A minimal class representing a vector with three components. Only behavior required for
 * the RMF Engine's proof of concept is supported. In the context of shapes.js, this class
 * serves as a drop-in replacement for p5.Vector.
 * 
 * Note: For simplicity and performance, parameters are not validated.
 */
export class Vector {
  #array;

  /** 
  * Create a vector.
  * @param {number} x  - The x-component.
  * @param {number} y  - The y-component.
  * @param {number} z  - The z-component.
  */
  constructor(x, y, z) {
    this.#array = [x, y, z];
  }

  /**
   * Convert the vector to an array. Returns a copy, not a reference, 
   * to prevent corruption of the underlying data.
   * @return {number[]} An array containing the components of the vector.
   */
  array() {
    return [...this.#array];
  }

  /**
   * The x-component of the vector.
   * @type {number}
   */
  get x() {
    return this.#array[0];
  }

  set x(value) {
      this.#array[0] = value;
  }

  /**
   * The y-component of the vector.
   * @type {number}
   */
  get y() {
    return this.#array[1];
  }

  set y(value) {
      this.#array[1] = value;
  }

  /**
   * The z-component of the vector.
   * @type {number}
   */
  get z() {
    return this.#array[2];
  }

  set z(value) {
      this.#array[2] = value;
  }

  /**
   * The distance between the vector and a given vector.
   * @param {Vector} vector - The given vector.
   * @return {number} - The distance.
   */
  dist(vector) {
    return Math.hypot(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  }

  /**
   * Returns `true` if the two vectors have the same components and `false` otherwise.
   * @param {Vector} vector - The given vector for comparison.
   * @return {boolean} - The truth value indicating whether the vectors are equal.
   */
  equals(vector) {
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
  }

  /**
   * Returns `true` if two vectors have approximately the same components and `false` otherwise.
   * 
   * If any pair of corresponding components differs by more than the `tolerance`, 
   * the comparison returns `false`. Otherwise, it returns `true`. For example, comparing 
   * vectors <2, 3, 5> and <2, 3, 5.2> returns `true` if the `tolerance` is `0.5` but `false` 
   * if it's `0.1`.
   * 
   * Geometrically, `v1.approximatelyEquals(v2)` checks if `v2` is inside a cube 
   * (including its faces) centered at `v1` with edge lengths equal to twice the tolerance. 
   * (This is a _closed ball_ centered at `v1` under the maximum/chessboard/Chebyshev/
   * $L_\infty$ metric.)
   * 
   * **Technical notes:**
   * 
   * Floating-point comparisons are subtle. 
   * 
   * For example, suppose the tolerance is 0.1. Then we'd expect <0.2, 0.2, 0.2> and 
   * <0.2 + 0.1, 0.2, 0.2> to be approximately equal, according to usual (real-number) arithmetic. 
   * However, in this case, `approximatelyEqual()` returns `false`. The reason is that 0.3 cannot 
   * be represented exactly in the computer's binary number system with only finitely many digits, 
   * just as 1 / 3 cannot be represented with only finitely many digits in the decimal system. 
   * This means 0.2 + 0.1 needs to be approximated, and the difference between the x-components 
   * ends up slightly larger than 0.1.
   * 
   * For similar reasons, precision varies based on the size of the numbers involved.
   * 
   * **Implementation approaches:**
   * Designing floating-point comparisons involves trade-offs, due to the subtleties involved, 
   * so implementations vary.
   * 
   * babylon.js:
   *  Tolerance type: Componentwise, absolute
   *  Tolerance default: `0.001`
   *  Source: See `equalsWithEpsilon(otherVector, [epsilon])` method of `Vector3`.
   *   
   * glMatrix:
   *   Tolerance type: Componentwise, absolute if both values are less than 1, relative otherwise
   *   Tolerance: `0.000001 * Math.max(1.0, Math.abs(aComponent), Math.abs(bComponent))`  
   *   Source: See `equals(a, b)` method of `vec3`.
   * 
   * Other approaches exist, such as Python's `math.isclose(a, b, *, rel_tol=1e-09, abs_tol=0.0)`,
   * which allows customizable relative and absolute tolerances.
   * 
   * The `approximatelyEquals()` function for this proof of concept adapts the basic approach of 
   * babylon.js. It's simple, while also allowing the user a degree of customization.
   * 
   * @param {Vector} vector - The given vector for comparison.
   * @param {number} [tolerance = 0.001] - The tolerance.
   *   Defaults to the named constant {@link constants.TOLERANCE}
   * @return {boolean} - The truth value indicating whether the vectors are approximately equal.
   */
  approximatelyEquals(vector, tolerance = constants.TOLERANCE) {
    return (
      Math.abs(vector.x - this.x) <= tolerance &&
      Math.abs(vector.y - this.y) <= tolerance &&
      Math.abs(vector.z - this.z) <= tolerance
    );
  }
}