import {boardIsFilled,claimPremiumNeighbor,type BoardState,type Side} from './engine';

/** Do not prompt another premium question after the last captured square. */
export function shouldOfferPremiumFollowUp(board:BoardState,correct:boolean,premium:boolean):boolean{
 return correct && premium && !boardIsFilled(board);
}

/** A premium capture NEVER changes the board level or steals an existing cell.
 * The already-completed square next to the just-answered line counts as the
 * FIRST square. The follow-up may fill ONE neighbouring square at most.
 * The final square of the level therefore stays one square, not two.
 */
export function awardPremiumSquares<T extends BoardState>(
 board:T,edge:string,side:Side,maximum=2
):{board:T;captured:string[];baseSquares:string[]}{
 const parts=/^(h|v)-(\d+)-(\d+)$/.exec(edge);
 if(!parts || maximum<1)return {board,captured:[],baseSquares:[]};
 const [,direction,rs,cs]=parts,r=Number(rs),c=Number(cs);
 const touches=direction==='h'?[[r-1,c],[r,c]]:[[r,c-1],[r,c]];
 const baseSquares=touches.filter(([row,col])=>row>=0&&col>=0&&row<board.rows&&col<board.cols)
   .map(([row,col])=>row+'-'+col)
   .filter(key=>board.owners[key]===side);
 // No box was closed with this line, so there is no associated free bonus box.
 if(!baseSquares.length||baseSquares.length>=maximum)return {board,captured:[],baseSquares};
 const result=claimPremiumNeighbor(board,baseSquares,side);
 return {board:result.board,captured:result.claimed?[result.claimed]:[],baseSquares};
}
