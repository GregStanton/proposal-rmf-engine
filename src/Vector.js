/**
 * @module Vector
 */

/**
 * A minimal class representing a vector with three components. Only behavior required for
 * the RMF Engine's proof of concept is supported.
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
  equals(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  // TODO: Add a method for approximate equality
}