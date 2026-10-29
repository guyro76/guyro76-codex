import type {BoardState,Side} from './engine';

/** Earned premium captures stay in the current board and never roll into a later stage.
 * The first bonus square touches the answered line; the second is a free neighbour.
 * If one square is left, the award is exactly one. An already-owned square is immutable.
 */
export function awardPremiumSquares<T extends BoardState>(
 board:T, edge:string, side:Side, maximum=2
):{board:T;captured:string[]}{
 const unowned:string[]=[];
 for(let r=0;r<board.rows;r++)for(let c=0;c<board.cols;c++){
  const key=r+'-'+c;if(!board.owners[key])unowned.push(key);
 }
 if(!unowned.length || maximum<1)return {board,captured:[]};
 const parts=/^(h|v)-(\d+)-(\d+)$/.exec(edge);
 if(!parts)return {board,captured:[]};
 const [,direction,rs,cs]=parts,r=Number(rs),c=Number(cs);
 const adjacent=direction==='h'?[[r-1,c],[r,c]]:[[r,c-1],[r,c]];
 const valid=(p:number[])=>p[0]>=0&&p[1]>=0&&p[0]<board.rows&&p[1]<board.cols;
 const choices=adjacent.filter(valid).map(([rr,cc])=>rr+'-'+cc).filter(k=>unowned.includes(k));
 const first=choices[0]??unowned
   .map(key=>({key,dist:Math.abs(Number(key.split('-')[0])-r)+Math.abs(Number(key.split('-')[1])-c)}))
   .sort((a,b)=>a.dist-b.dist)[0]?.key;
 if(!first)return {board,captured:[]};
 const [fr,fc]=first.split('-').map(Number);
 const candidates=unowned.filter(key=>key!==first).map(key=>{
  const [rr,cc]=key.split('-').map(Number);
  return {key,dist:Math.abs(rr-fr)+Math.abs(cc-fc)};
 }).sort((a,b)=>a.dist-b.dist||a.key.localeCompare(b.key));
 const captured=[first];
 if(maximum>1&&unowned.length>1){
  const next=candidates.find(v=>v.dist===1);
  // Only reward an adjacent square; never choose an arbitrary distant square.
  if(next)captured.push(next.key);
 }
 const owners={...board.owners},edges={...board.edges},scores={...board.scores};
 for(const key of captured){
  const [sr,sc]=key.split('-').map(Number);
  owners[key]=side;
  for(const e of ['h-'+sr+'-'+sc,'h-'+(sr+1)+'-'+sc,'v-'+sr+'-'+sc,'v-'+sr+'-'+(sc+1)]){
   if(!edges[e])edges[e]=side;
  }
 }
 scores[side]+=captured.length;
 return {board:{...board,edges,owners,scores,turn:side},captured};
}
