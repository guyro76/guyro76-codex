import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gestureCopy,gestureGames,markTarget,requiredTargets} from '../src/lib/gestureIntermissions.ts';
test('gesture challenges require distinct valid targets',()=>{
 let marks=[];
 for(const index of [0,0,-1,9,NaN,1,2])marks=markTarget(marks,index,9);
 assert.deepEqual(marks,[0,1,2]);
 assert.equal(requiredTargets('scratch'),6);
 assert.equal(requiredTargets('sword'),3);
 assert.equal(requiredTargets('scissors'),3);
});
test('all six languages have complete challenge instructions',()=>{
 assert.deepEqual(Object.keys(gestureCopy).sort(),['ar','en','es','fr','he','ru']);
 for(const copy of Object.values(gestureCopy))for(const kind of gestureGames){
 assert.ok(copy[kind].length>3);assert.ok(copy[`${kind}Help`].length>20);
 }
});
