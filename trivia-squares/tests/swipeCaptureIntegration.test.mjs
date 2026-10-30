import test from 'node:test';
import assert from 'node:assert/strict';
import {dotXY,edgeFromSwipe} from '../src/lib/dotDrawing.ts';
import {applyLocalAnswer} from '../src/lib/engine.ts';

const segments=[
 [{row:0,col:0},{row:0,col:1},'h-0-0'],
 [{row:1,col:0},{row:1,col:1},'h-1-0'],
 [{row:0,col:0},{row:1,col:0},'v-0-0'],
 [{row:0,col:1},{row:1,col:1},'v-0-1']
];
function permutations(items){
 if(items.length===0)return [[]];
 return items.flatMap((v,i)=>permutations(items.filter((_,j)=>j!==i)).map(rest=>[v,...rest]));
}
test('square is captured exactly once regardless of final edge, drawing order and direction',()=>{
 for(const indices of permutations([0,1,2,3])){
  for(const reversed of [false,true]){
   let board={rows:3,cols:3,turn:'host',edges:{},owners:{},scores:{host:0,guest:0,bot:0}};
   for(let i=0;i<4;i++){
    const [start,end,key]=segments[indices[i]];
    const a=reversed?end:start,b=reversed?start:end;
    const edge=edgeFromSwipe(a,dotXY(b,3,3),3,3);
    assert.equal(edge,key,JSON.stringify({indices,reversed,i}));
    board=applyLocalAnswer(board,edge,true,true);
    assert.equal(board.scores.host,i===3?1:0);
    assert.equal(Object.keys(board.owners).length,i===3?1:0);
   }
   assert.equal(board.owners['0-0'],'host');
   assert.equal(Object.keys(board.edges).length,4);
  }
 }
});
test('an answered line can never be reused to earn the same square twice',()=>{
 const a={rows:3,cols:3,turn:'host',edges:{'h-0-0':'host','h-1-0':'host','v-0-0':'host'},owners:{},scores:{host:0,guest:0,bot:0}};
 const b=applyLocalAnswer(a,'v-0-1',true,true);
 const again=applyLocalAnswer(b,'v-0-1',true,true);
 assert.deepEqual(again,b);
 assert.equal(again.scores.host,1);
});
