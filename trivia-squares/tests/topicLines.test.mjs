import test from 'node:test';
import assert from 'node:assert/strict';
import {pickTopicLines,topicLineCount,allEdgeKeys} from '../src/lib/topicLines.ts';
test('only 2 lines on 3x3 and 3 on larger boards carry a topic; topics never repeat; same seed same lines',()=>{
 const topics=['music','science','sports','history','nature'];
 assert.equal(Object.keys(pickTopicLines('r1',3,3,topics,{})).length,2);
 for(const n of [4,5,6]){const l=pickTopicLines('r'+n,n,n,topics,{});assert.equal(Object.keys(l).length,3);
  assert.equal(new Set(Object.values(l)).size,3);for(const k of Object.keys(l))assert.ok(allEdgeKeys(n,n).includes(k));}
 assert.deepEqual(pickTopicLines('same',4,4,topics,{}),pickTopicLines('same',4,4,topics,{}));
 assert.equal(topicLineCount(3,3),2);
 // Drawn lines are never chosen; fewer topics than lines gives fewer lines.
 const drawn=Object.fromEntries(allEdgeKeys(3,3).slice(0,23).map(k=>[k,'host']));
 const l=pickTopicLines('x',3,3,topics,drawn);for(const k of Object.keys(l))assert.ok(!drawn[k]);
 assert.equal(Object.keys(pickTopicLines('y',4,4,['music'],{})).length,1);
});
