// Geometry shared by pointer/touch drawing and keyboard accessibility.
// The player must start at an actual dot and finish at an adjacent dot.
export type Dot = { row: number; col: number };
export type BoardPoint = { x: number; y: number };
export const BOARD_START = 20;
export const BOARD_SPAN = 288;
export const VIEW_BOX_SIZE = 328;

export function dotXY(dot: Dot, rows: number, cols: number): BoardPoint {
  return {
    x: BOARD_START + dot.col * BOARD_SPAN / cols,
    y: BOARD_START + dot.row * BOARD_SPAN / rows
  };
}

export function nearestDot(pos: BoardPoint, rows: number, cols: number): Dot | null {
  const stepX = BOARD_SPAN / cols;
  const stepY = BOARD_SPAN / rows;
  const col = Math.round((pos.x - BOARD_START) / stepX);
  const row = Math.round((pos.y - BOARD_START) / stepY);
  if (row < 0 || row > rows || col < 0 || col > cols) return null;
  const dot = { row, col };
  const center = dotXY(dot, rows, cols);
  // Scale sensitivity for dense boards; no hit zone reaches an adjacent dot.
  const radius = Math.min(22, Math.min(stepX, stepY) * .45);
  return Math.hypot(pos.x - center.x, pos.y - center.y) <= radius ? dot : null;
}

export function edgeBetween(a: Dot, b: Dot, rows: number, cols: number): string | null {
  if (a.row < 0 || b.row < 0 || a.col < 0 || b.col < 0
    || a.row > rows || b.row > rows || a.col > cols || b.col > cols) return null;
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  if (dr + dc !== 1) return null;
  if (dr === 0) return 'h-' + a.row + '-' + Math.min(a.col, b.col);
  return 'v-' + Math.min(a.row, b.row) + '-' + a.col;
}
