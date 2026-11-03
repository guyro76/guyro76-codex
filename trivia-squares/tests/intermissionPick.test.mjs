import test from 'node:test';
import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {chooseIntermission,LOCAL_INTERMISSIONS,ONLINE_INTERMISSIONS}=await import('../src/lib/intermissionPick.ts');

test('random mini-game: every game can come up, never twice in a row, stable per stage',()=>{
 store.clear();
 const seen=new Set();let prev='';
 for(let i=0;i<400;i++){
  const k=chooseIntermission('stage-'+i,false);
  assert.notEqual(k,prev,'same game twice in a row at '+i);
  assert.equal(chooseIntermission('stage-'+i,false),k,'reload must keep the same game');
  seen.add(k);prev=k;
 }
 assert.deepEqual([...seen].sort(),[...LOCAL_INTERMISSIONS].sort());
});

test('online matches only get games the server can award',()=>{
 store.clear();
 for(let i=0;i<200;i++)assert.ok(ONLINE_INTERMISSIONS.includes(chooseIntermission('m-'+i,true)));
});
