import test from 'node:test';
import assert from 'node:assert/strict';
import {dotXY,edgeFromSwipe,edgeBetween} from '../src/lib/dotDrawing.ts';
const add=(d,dx,dy)=>({x:d.x+dx,y:d.y+dy});

test('all four swipe directions open exactly the same canonical edge',()=>{
 for(const size of [3,4,5,6]){
  const a={row:1,col:1};
  const dot=dotXY(a,size,size);
  const step=288/size;
  assert.equal(edgeFromSwipe(a,add(dot,-step,0),size,size),'h-1-0');
  assert.equal(edgeFromSwipe(a,add(dot,step,0),size,size),'h-1-1');
  assert.equal(edgeFromSwipe(a,add(dot,0,-step),size,size),'v-0-1');
  assert.equal(edgeFromSwipe(a,add(dot,0,step),size,size),'v-1-1');
  for(const [dx,dy,expected] of [[-1,0,'h-1-0'],[1,0,'h-1-1'],[0,-1,'v-0-1'],[0,1,'v-1-1']]){
   assert.equal(edgeFromSwipe(a,add(dot,dx*step*.72,dy*step*.72),size,size),expected);
  }
 }
});
test('swiping backward over a previously chosen edge yields identical key',()=>{
 for(const size of [3,4,5,6]){
  const step=288/size;
  const a={row:1,col:1};
  const right={row:1,col:2},down={row:2,col:1};
  assert.equal(edgeFromSwipe(a,add(dotXY(a,size,size),step,0),size,size),
    edgeFromSwipe(right,add(dotXY(right,size,size),-step,0),size,size));
  assert.equal(edgeFromSwipe(a,add(dotXY(a,size,size),0,step),size,size),
    edgeFromSwipe(down,add(dotXY(down,size,size),0,-step),size,size));
 }
});
test('diagonals, stationery, skips and substantial axis drift never earn an edge',()=>{
 for(const size of [3,4,5,6]){
  const a={row:1,col:1},p=dotXY(a,size,size),step=288/size;
  for(const target of [
   add(p,step,step),add(p,-step,step),add(p,step,-step),
   p,add(p,step*.35,0),add(p,2*step,0),add(p,step*.7,step*.43),
   add(p,step*.8,step*.45),add(p,-step*.75,-step*.5)
  ])assert.equal(edgeFromSwipe(a,target,size,size),null,JSON.stringify({size,target}));
  assert.equal(edgeBetween(a,{row:2,col:2},size,size),null);
 }
});
