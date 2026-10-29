export type Side = 'host' | 'guest' | 'bot';

export type BoardState = {
  rows: number;
  cols: number;
  turn: Side;
  edges: Record<string, Side>;
  owners: Record<string, Side>;
  scores: Record<Side, number>;
};

export function validEdge(board: BoardState, value: string): boolean {
  const found = /^(h|v)-(\d+)-(\d+)$/.exec(value);
  if (!found) return false;
  const direction=found[1], r=Number(found[2]), c=Number(found[3]);
  if (!Number.isInteger(r)||!Number.isInteger(c)) return false;
  if(direction==='h') return r>=0 && r<=board.rows && c>=0 && c<board.cols;
  return r>=0 && r<board.rows && c>=0 && c<=board.cols;
}

export function applyLocalAnswer<T extends BoardState>(board: T, edge: string, correct: boolean): T {
  if(!validEdge(board,edge) || board.edges[edge]) return board;
  const nextTurn=board.turn==='host'?'guest':'host';
  if(!correct) return {...board,turn:nextTurn};
  const edges={...board.edges,[edge]:board.turn};
  const owners={...board.owners};
  const scores={...board.scores};
  let gained=0;
  for(let r=0;r<board.rows;r++) for(let c=0;c<board.cols;c++){
    const square=`${r}-${c}`;
    if(owners[square]) continue;
    if(edges[`h-${r}-${c}`]&&edges[`h-${r+1}-${c}`]&&edges[`v-${r}-${c}`]&&edges[`v-${r}-${c+1}`]){
      owners[square]=board.turn;
      gained++;
    }
  }
  scores[board.turn]+=gained;
  return {...board,edges,owners,scores,turn:gained?board.turn:nextTurn};
}
