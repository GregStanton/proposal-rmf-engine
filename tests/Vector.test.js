import { expect, test } from 'vitest'
import { sum } from '../src/Vector.js'

// just making sure Vitest works (will delete this later)
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})