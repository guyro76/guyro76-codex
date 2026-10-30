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

/** Accept deliberate orthogonal strokes even when the finger lifts slightly
 * before/after the destination dot. Direction is never inferred from RTL.
 * Diagonal, stationary, two-cell and cross-axis gestures remain invalid. */
export function edgeFromSwipe(start:Dot,release:BoardPoint,rows:number,cols:number):string|null {
 const exact=nearestDot(release,rows,cols);
 if(exact)return edgeBetween(start,exact,rows,cols);
 const origin=dotXY(start,rows,cols);
 const dx=release.x-origin.x,dy=release.y-origin.y;
 const stepX=BOARD_SPAN/cols,stepY=BOARD_SPAN/rows;
 const horizontal=Math.abs(dx)>Math.abs(dy);
 const along=horizontal?Math.abs(dx)/stepX:Math.abs(dy)/stepY;
 const across=horizontal?Math.abs(dy):Math.abs(dx);
 const allowableDrift=Math.min(18,(horizontal?stepY:stepX)*.24);
 if(along<.60 || along>1.28 || across>allowableDrift)return null;
 const target:Dot=horizontal
   ?{row:start.row,col:start.col+Math.sign(dx)}
   :{row:start.row+Math.sign(dy),col:start.col};
 return edgeBetween(start,target,rows,cols);
}
