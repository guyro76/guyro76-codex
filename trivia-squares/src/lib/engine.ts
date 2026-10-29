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

export function applyLocalAnswer<T extends BoardState>(board: T, edge: string, correct: boolean, solo = false): T {
  if(!validEdge(board,edge) || board.edges[edge]) return board;
  const acting:Side=solo?'host':board.turn;
  const nextTurn=solo?'host':board.turn==='host'?'guest':'host';
  if(!correct) return {...board,turn:nextTurn};
  const edges={...board.edges,[edge]:acting};
  const owners={...board.owners};
  const scores={...board.scores};
  let gained=0;
  for(let r=0;r<board.rows;r++) for(let c=0;c<board.cols;c++){
    const square=`${r}-${c}`;
    if(owners[square]) continue;
    if(edges[`h-${r}-${c}`]&&edges[`h-${r+1}-${c}`]&&edges[`v-${r}-${c}`]&&edges[`v-${r}-${c+1}`]){
      owners[square]=acting;
      gained++;
    }
  }
  scores[acting]+=gained;
  return {...board,edges,owners,scores,turn:solo?'host':gained?acting:nextTurn};
}

/** Repair legacy solo boards which accidentally granted edges and squares to a phantom second player. */
export function repairSoloBoard<T extends BoardState>(board:T):T {
  const edges=Object.fromEntries(Object.entries(board.edges).map(([key])=>[key,'host' as Side]));
  const owners=Object.fromEntries(Object.entries(board.owners).map(([key])=>[key,'host' as Side]));
  return {...board,turn:'host',edges,owners,scores:{...board.scores,host:Object.keys(owners).length,guest:0,bot:0}};
}
