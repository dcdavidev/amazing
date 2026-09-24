/**
 * Rounds a floating-point number to two decimal places.
 *
 * @param value - The raw monetary number.
 * @returns The rounded number with two decimals.
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
