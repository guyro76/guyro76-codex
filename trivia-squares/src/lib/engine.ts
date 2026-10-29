export type Side = 'host' | 'guest' | 'bot';

export type BoardState = {
  rows: number;
  cols: number;
  turn: Side;
  edges: Record<string, Side>;
  owners: Record<string, Side>;
  scores: Record<Side, number>;
  solo?: boolean;
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

/** Generic placeholders are never valid opponents. An empty second-player
 * field means a solo game; single player cannot surrender a turn. */
export function hasNamedSecondPlayer(value:unknown,hostName=''):boolean{
 if(typeof value!=='string')return false;
 const name=value.trim();
 return name.length>=2 && !/^(?:שחקן\s*(?:2|שני|ב)|player\s*(?:2|two)|second\s*player)$/iu.test(name)
  && name.toLocaleLowerCase()!==hostName.trim().toLocaleLowerCase();
}

/** Repair historic solo saves without resetting edges or the board.
 * Only call when no real second player was configured. */
export function repairSoloBoard<T extends BoardState>(board:T):T{
 if(board.solo===true && board.turn==='host' && board.scores.guest===0 &&
  !Object.values(board.owners).includes('guest') && !Object.values(board.edges).includes('guest'))return board;
 const edges=Object.fromEntries(Object.entries(board.edges).map(([key,owner])=>[key,owner==='guest'?'host':owner])) as Record<string,Side>;
 const owners=Object.fromEntries(Object.entries(board.owners).map(([key,owner])=>[key,owner==='guest'?'host':owner])) as Record<string,Side>;
 return {...board,solo:true,turn:'host',edges,owners,scores:{...board.scores,host:board.scores.host+board.scores.guest,guest:0}};
}

/** Premium prize: at most one EXTRA unclaimed square adjacent to a square
 * completed by the current line. This cannot steal or silently claim other
 * cells, and cannot move the player into the next campaign stage.
 * The last square of a board has no neighbor: it remains a single capture.
 */
export function claimPremiumNeighbor<T extends BoardState>(
 board:T,sourceSquares:readonly string[],owner:Side
):{board:T;claimed:string|null}{
 if(!sourceSquares.length||Object.keys(board.owners).length>=board.rows*board.cols)
   return {board,claimed:null};
 const candidates=new Set<string>();
 for(const source of sourceSquares){
   const [r,c]=source.split('-').map(Number);
   if(!Number.isInteger(r)||!Number.isInteger(c))continue;
   for(const [dr,dc] of [[0,-1],[0,1],[-1,0],[1,0]]){
     const nr=r+dr,nc=c+dc,key=nr+'-'+nc;
     if(nr>=0&&nc>=0&&nr<board.rows&&nc<board.cols&&!board.owners[key])candidates.add(key);
   }
 }
 for(const key of candidates){
   const [r,c]=key.split('-').map(Number);
   const edges={...board.edges};
   for(const edge of ['h-'+r+'-'+c,'h-'+(r+1)+'-'+c,'v-'+r+'-'+c,'v-'+r+'-'+(c+1)])
     if(!edges[edge])edges[edge]=owner;
   const completed:string[]=[];
   for(let row=0;row<board.rows;row++)for(let col=0;col<board.cols;col++){
     const square=row+'-'+col;
     if(board.owners[square])continue;
     if(edges['h-'+row+'-'+col]&&edges['h-'+(row+1)+'-'+col]&&
        edges['v-'+row+'-'+col]&&edges['v-'+row+'-'+(col+1)])completed.push(square);
   }
   if(completed.length!==1||completed[0]!==key)continue;
   const owners={...board.owners,[key]:owner};
   const scores={...board.scores,[owner]:board.scores[owner]+1};
   return {board:{...board,edges,owners,scores},claimed:key};
 }
 return {board,claimed:null};
}
