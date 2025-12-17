import { expect, test } from 'vitest'
import { Vector } from '../src/Vector.js'

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

test('v1.equals(v2) is true if v1 and v2 have the same components', () => {
  const v1 = new Vector(4, 5, 1); 
  const v2 = new Vector(4, 5, 1);
  expect(v1.equals(v2)).toBe(true);
})

test('v1.equals(v2) is false if only the z-components of v1 and v2 differ', () => {
  const v1 = new Vector(4, 5, 1); 
  const v2 = new Vector(4, 5, 2);
  expect(v1.equals(v2)).toBe(false);
})