import test from 'node:test';
import assert from 'node:assert/strict';
import { dotXY, nearestDot, edgeBetween } from '../src/lib/dotDrawing.ts';

test('drag to adjacent dot only, both directions', () => {
  assert.equal(edgeBetween({row:0,col:0},{row:0,col:1},3,3), 'h-0-0');
  assert.equal(edgeBetween({row:0,col:1},{row:0,col:0},3,3), 'h-0-0');
  assert.equal(edgeBetween({row:0,col:0},{row:1,col:0},3,3), 'v-0-0');
  assert.equal(edgeBetween({row:1,col:0},{row:0,col:0},3,3), 'v-0-0');
});

test('non-adjacent, diagonal and identical endpoints never make an edge', () => {
  assert.equal(edgeBetween({row:0,col:0},{row:0,col:0},3,3),null);
  assert.equal(edgeBetween({row:0,col:0},{row:1,col:1},3,3),null);
  assert.equal(edgeBetween({row:0,col:0},{row:0,col:2},3,3),null);
  assert.equal(edgeBetween({row:0,col:0},{row:2,col:0},3,3),null);
  assert.equal(edgeBetween({row:0,col:0},{row:-1,col:0},3,3),null);
  assert.equal(edgeBetween({row:3,col:3},{row:3,col:4},3,3),null);
});

test('all displayed board sizes have accurate dot hit locations', () => {
  for (const size of [3,4,5,6]) {
    for (let row=0;row<=size;row++) for(let col=0;col<=size;col++) {
      const original={row,col};
      assert.deepEqual(nearestDot(dotXY(original,size,size),size,size),original);
    }
  }
});

test('empty space is not mistaken for a dot', () => {
  assert.equal(nearestDot({x:64,y:66},3,3),null);
  assert.equal(nearestDot({x:-8,y:20},3,3),null);
});

test('drawing the same edge from different endpoints has the same key', () => {
  for (let s=3;s<=6;s++) for (let r=0;r<=s;r++) for(let c=0;c<s;c++){
    assert.equal(edgeBetween({row:r,col:c},{row:r,col:c+1},s,s),
      edgeBetween({row:r,col:c+1},{row:r,col:c},s,s));
  }
});
