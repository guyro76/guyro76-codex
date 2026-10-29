import test from 'node:test';
import assert from 'node:assert/strict';
import {reassignCapture} from '../src/lib/captureOwnership.ts';

function board() {
  return {rows:3,cols:3,mode:'local',turn:'host',
    edges:{'h-0-0':'host','h-1-0':'guest','v-0-0':'guest','v-0-1':'host'},
    owners:{'0-0':'host','0-1':'host'},scores:{host:2,guest:0,bot:0}};
}
test('reassigning a captured square transfers exactly one point, not an edge or turn',()=>{
  const before=board();
  const next=reassignCapture(before,['0-0'],'guest');
  assert.equal(next.owners['0-0'],'guest');
  assert.deepEqual(next.scores,{host:1,guest:1,bot:0});
  assert.deepEqual(next.edges,before.edges);
  assert.equal(next.turn,'host');
  assert.equal(before.owners['0-0'],'host');
});
test('reassigns two squares from one move without double counting duplicates',()=>{
  const next=reassignCapture(board(),['0-0','0-1','0-1'],'guest');
  assert.equal(next.scores.guest,2);
  assert.equal(next.scores.host,0);
});
test('rejects unclaimed, out of bounds, nonexistent or malformed squares',()=>{
  const before=board();
  assert.equal(reassignCapture(before,['3-0','0-2','bad','-1-0'],'guest'),before);
});
test('same owner is a no-op and zero points never go negative',()=>{
  const before=board();
  assert.equal(reassignCapture(before,['0-0'],'host'),before);
});
