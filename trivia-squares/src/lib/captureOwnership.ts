import type { BoardState } from './engine';

export type LocalOwner = 'host' | 'guest';
export type LocalOwnerMode = 'auto' | 'manual' | 'auto_with_override';

// Ownership corrections never alter a drawn edge or the original turn sequence.
// Each captured cell contributes exactly one point, even when several are corrected at once.
export function reassignCapture<T extends BoardState>(board:T,keys:readonly string[],owner:LocalOwner):T {
  if(owner!=='host' && owner!=='guest')return board;
  const owners={...board.owners},scores={...board.scores};
  let changed=false;
  for(const key of new Set(keys)){
    if(!/^\d+-\d+$/.test(key))continue;
    const [row,col]=key.split('-').map(Number);
    if(row<0 || row>=board.rows || col<0 || col>=board.cols)continue;
    const previous=owners[key];
    if((previous!=='host' && previous!=='guest') || previous===owner)continue;
    owners[key]=owner;
    scores[previous]=Math.max(0,scores[previous]-1);
    scores[owner]+=1;
    changed=true;
  }
  return changed?{...board,owners,scores}:board;
}
