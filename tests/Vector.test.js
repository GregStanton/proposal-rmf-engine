import { describe, expect, test } from 'vitest';
import { Vector } from '../src/Vector.js';
import * as constants from '../src/constants.js';

describe('Vector', () => {
  describe('array()', () => {
    test('vector.array() gets [2, 3, 5] from vector <2, 3, 5>', () => {
      const vector = new Vector(2, 3, 5);
      expect(vector.array()).toEqual([2, 3, 5]);
    })

    test('mutating vector.array() does not mutate internal array', () => {
      const vector = new Vector(2, 3, 5);
      const array = vector.array();
      array[0] = 1;
      expect(vector.array()).toEqual([2, 3, 5]);
    })
  });
  describe(`x, y, z`, () => {
    test('vector.x gets 2 from vector <2, 3, 5>', () => {
      const vector = new Vector(2, 3, 5);
      expect(vector.x).toBe(2);
    })

    test('setting vector.x to 1 makes vector.array()[0] equal 1', () => {
      const vector = new Vector(2, 3, 5);
      vector.x = 1;
      expect(vector.array()[0]).toBe(1);
    })

    test('vector.y gets 3 from vector <2, 3, 5>', () => {
      const vector = new Vector(2, 3, 5);
      expect(vector.y).toBe(3);
    })

    test('setting vector.y to 1 makes vector.array()[1] equal 1', () => {
      const vector = new Vector(2, 3, 5);
      vector.y = 1;
      expect(vector.array()[1]).toBe(1);
    })

    test('vector.z gets 5 from vector <2, 3, 5>', () => {
      const vector = new Vector(2, 3, 5);
      expect(vector.z).toBe(5);
    })

    test('setting vector.z to 1 makes vector.array()[2] equal 1', () => {
      const vector = new Vector(2, 3, 5);
      vector.z = 1;
      expect(vector.array()[2]).toBe(1);
    })
  });
  describe('dist(vector)', () => {
    test('distance from <1, 1, 1> to <4, 5, 1> is 5', () => {
      const v1 = new Vector(1, 1, 1);
      const v2 = new Vector(4, 5, 1); 
      expect(v1.dist(v2)).toBe(5);
    })

    test('distance from <4, 5, 1> to <1, 1, 1> is 5', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(1, 1, 1);
      expect(v1.dist(v2)).toBe(5);
    })

    test('distance from <4, 5, 1> to <4, 5, 1> is 0', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4, 5, 1);
      expect(v1.dist(v2)).toBe(0);
    })
  });
  describe('equals(vector)', () => {
    test('v1.equals(v2) is true if v1 and v2 have the same components', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4, 5, 1);
      expect(v1.equals(v2)).toBe(true);
    })

    test('v1.equals(v2) is false if only the x-components of v1 and v2 differ', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4.0001, 5, 1);
      expect(v1.equals(v2)).toBe(false);
    })

    test('v1.equals(v2) is false if only the y-components of v1 and v2 differ', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4, 5.0001, 1);
      expect(v1.equals(v2)).toBe(false);
    })

    test('v1.equals(v2) is false if only the z-components of v1 and v2 differ', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4, 5, 1.0001);
      expect(v1.equals(v2)).toBe(false);
    })
  });
  describe('approximatelyEquals(vector)', () => {
    test('v1.approximatelyEquals(v2) is true if components are all within default tolerance', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4, 5, 1 + constants.TOLERANCE / 2);
      expect(v1.approximatelyEquals(v2)).toBe(true);
    })
    
    test('v1.approximatelyEquals(v2) is true if components are all within custom tolerance', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4, 5, 1 + 0.1 / 2);
      expect(v1.approximatelyEquals(v2, 0.1)).toBe(true);
    })
    
    test('v1.approximatelyEquals(v2) is false if v2.x - v1.x exceeds the default tolerance', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4  + 2 * constants.TOLERANCE, 5, 1);
      expect(v1.approximatelyEquals(v2)).toBe(false);
    })
    
    test('v1.approximatelyEquals(v2) is false if v2.y - v1.y exceeds the default tolerance', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4, 5 + 2 * constants.TOLERANCE, 1);
      expect(v1.approximatelyEquals(v2)).toBe(false);
    })
    
    test('v1.approximatelyEquals(v2) is false if v2.z - v1.z exceeds the default tolerance', () => {
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4, 5, 1 + 2 * constants.TOLERANCE);
      expect(v1.approximatelyEquals(v2)).toBe(false);
    })
    
    test('v1.approximatelyEquals(v2) is true if components of v2 - v1 all equal tolerance (using safe dyadic rationals)', () => {
      const dyadicRational = 1 / 2;
      const v1 = new Vector(4, 5, 1); 
      const v2 = new Vector(4 + dyadicRational, 5 + dyadicRational, 1 + dyadicRational);
      expect(v1.approximatelyEquals(v2, dyadicRational)).toBe(true);
    })
    
    test('v1.approximatelyEquals(v2) is false if components of v1 - v2 all exceed default tolerance (symmetry check)', () => {
      const doubleTolerance = 2 * constants.TOLERANCE;
      const v1 = new Vector(4 + doubleTolerance, 5 + doubleTolerance, 1 + doubleTolerance); 
      const v2 = new Vector(4, 5, 1);
      expect(v1.approximatelyEquals(v2)).toBe(false);
    })
  });
});
