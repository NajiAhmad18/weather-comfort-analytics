export function clamp(value: number, min: number = 0, max: number = 100): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
