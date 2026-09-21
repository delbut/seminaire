export const POINTS_BY_POSITION: Record<number, number> = {
  1: 6,
  2: 5,
  3: 4,
  4: 3,
  5: 2,
  6: 1,
};

export function pointsForPosition(position: number): number {
  return POINTS_BY_POSITION[position] ?? 0;
}
