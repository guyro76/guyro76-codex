import type {BoardState,Side} from './engine';

/**
 * A correct premium follow-up grants up to TWO squares in the vicinity of the
 * triggering line. Squares already captured by the same player count toward
 * that total; an unclaimed square is completed without taking opponents' cells.
 * If only one square remains on the board, exactly one may be captured.
 *
 * All new owned squares must be backed by four filled edges. An extra edge is
 * never painted over an opponent's line. If a candidate would accidentally
 * complete another square, skip it instead of silently awarding extra points.
 */
function fillCandidate<T extends BoardState>(board:T,key:string,side:Side):T|null{
 const [r,c]=key.split('-').map(Number);
 if(!Number.isInteger(r)||!Number.isInteger(c)||r<0||c<0||r>=board.rows||c>=board.cols||board.owners[key])return null;
 const boundary=['h-'+r+'-'+c,'h-'+(r+1)+'-'+c,'v-'+r+'-'+c,'v-'+r+'-'+(c+1)];
 const edges={...board.edges};
 for(const edge of boundary)if(!edges[edge])edges[edge]=side;
 // Protect against an inconsistent save or a corner case that fills other boxes.
 const closed:string[]=[];
 for(let row=0;row<board.rows;row++)for(let col=0;col<board.cols;col++){
  const square=row+'-'+col;
  if(board.owners[square])continue;
  if(edges['h-'+row+'-'+col]&&edges['h-'+(row+1)+'-'+col]&&edges['v-'+row+'-'+col]&&edges['v-'+row+'-'+(col+1)])
   closed.push(square);
 }
 if(closed.length!==1||closed[0]!==key)return null;
 return {...board,edges,owners:{...board.owners,[key]:side},scores:{...board.scores,[side]:board.scores[side]+1}};
}
function adjacent(board:BoardState,keys:string[]):string[]{
 const found:string[]=[];
 for(const key of keys){
  const [r,c]=key.split('-').map(Number);
  for(const [dr,dc] of [[1,0],[0,1],[-1,0],[0,-1]]){
   const nr=r+dr,nc=c+dc,k=nr+'-'+nc;
   if(nr>=0&&nc>=0&&nr<board.rows&&nc<board.cols&&!found.includes(k))found.push(k);
  }
 }
 return found;
}
export function awardPremiumSquares<T extends BoardState>(
 board:T,edge:string,side:Side,maximum=2
):{board:T;captured:string[];baseSquares:string[]}{
 const parts=/^(h|v)-(\d+)-(\d+)$/.exec(edge);
 if(!parts||maximum<1||!['host','guest','bot'].includes(side))return {board,captured:[],baseSquares:[]};
 const r=Number(parts[2]),c=Number(parts[3]);
 const contacts=(parts[1]==='h'?[[r-1,c],[r,c]]:[[r,c-1],[r,c]])
  .filter(([row,col])=>row>=0&&col>=0&&row<board.rows&&col<board.cols)
  .map(([row,col])=>row+'-'+col);
 const baseSquares=contacts.filter(k=>board.owners[k]===side);
 if(baseSquares.length>=maximum)return {board,captured:[],baseSquares};
 let next=board;
 const captured:string[]=[];
 // Prefer an existing completed square and its nearest free neighbour; when
 // there is no completed square, fill the line's square first, then its neighbour.
 const seeds=baseSquares.length?baseSquares:contacts;
 let candidates=baseSquares.length?[...adjacent(board,seeds),...contacts]:[...contacts,...adjacent(board,contacts)];
 for(const candidate of candidates){
  if(baseSquares.length+captured.length>=maximum)break;
  if(next.owners[candidate])continue;
  if(!baseSquares.length&&captured.length>0&&!adjacent(next,captured).includes(candidate))continue;
  const result=fillCandidate(next,candidate,side);
  if(!result)continue;
  next=result;captured.push(candidate);
 }
 return {board:next,captured,baseSquares};
}
