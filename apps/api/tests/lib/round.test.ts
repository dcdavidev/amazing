import { describe, expect, it } from 'vitest';

import { roundToTwoDecimals } from '../../src/lib/round.ts';

describe('roundToTwoDecimals', () => {
  it('rounds standard decimal numbers to 2 decimal places', () => {
    expect(roundToTwoDecimals(10.554)).toBe(10.55);
    expect(roundToTwoDecimals(10.555)).toBe(10.56);
    expect(roundToTwoDecimals(10.556)).toBe(10.56);
  });

  it('handles floating point precision edge cases like 1.005', () => {
    expect(roundToTwoDecimals(1.005)).toBe(1.01);
  });

  it('preserves exact integers and single-decimal numbers', () => {
    expect(roundToTwoDecimals(0)).toBe(0);
    expect(roundToTwoDecimals(5)).toBe(5);
    expect(roundToTwoDecimals(5.5)).toBe(5.5);
  });

  it('correctly rounds negative values', () => {
    expect(roundToTwoDecimals(-10.555)).toBe(-10.55);
    expect(roundToTwoDecimals(-10.554)).toBe(-10.55);
    expect(roundToTwoDecimals(-10.556)).toBe(-10.56);
  });
});
