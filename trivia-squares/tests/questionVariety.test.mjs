import test from 'node:test';
import assert from 'node:assert/strict';
import {selectVariedQuestion,isGeographyQuestion} from '../src/lib/questionMix.ts';

const canon=t=>t.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const city=i=>({id:i,category:'גאוגרפיה',text:'באיזו מדינה נמצאת העיר '+i+'?'});
const music=i=>({id:10000+i,category:'מוזיקה ישראלית',text:'מי שר את השיר מספר '+i+'?'});
const film=i=>({id:20000+i,category:'קולנוע',text:'באיזה סרט מופיעה הדמות '+i+'?'});

test('city rows are classified as geography',()=>{
 assert.equal(isGeographyQuestion(city(1)),true);
 assert.equal(isGeographyQuestion(music(1)),false);
});

test('topic rotation favors varied unseen questions when they exist',()=>{
 const unseen=[city(1),city(2),music(1),film(1)];
 const topics=[];let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const chosen=[];
 for(let draw=0;draw<unseen.length;draw++){
  const pool=unseen.filter(q=>!chosen.includes(q));
  const selection=selectVariedQuestion(pool,topics,rnd);
  assert.ok(selection);
  assert.ok(!chosen.includes(selection.question));
  chosen.push(selection.question);topics.push(selection.topic);
 }
 assert.equal(new Set(chosen.map(q=>canon(q.text))).size,unseen.length);
});

test('exhausted varied bank never reintroduces a previously seen question',()=>{
 const seen=[...Array.from({length:40},(_,i)=>music(i)),...Array.from({length:40},(_,i)=>film(i))];
 const unseen=Array.from({length:100},(_,i)=>city(i));
 const seenTexts=new Set(seen.map(q=>canon(q.text)));
 const eligible=[...seen,...unseen].filter(q=>!seenTexts.has(canon(q.text)));
 assert.equal(eligible.length,100);
 let remaining=[...eligible],seed=13;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const drawn=new Set();
 for(let draw=0;draw<20;draw++){
  const chosen=selectVariedQuestion(remaining,[],rnd);
  assert.ok(chosen);
  const key=canon(chosen.question.text);
  assert.ok(!seenTexts.has(key),'recycled an already-seen question');
  assert.ok(!drawn.has(key),'repeated a question in the same game');
  drawn.add(key);
  remaining=remaining.filter(q=>q!==chosen.question);
 }
 assert.equal(drawn.size,20);
 assert.ok([...drawn].every(key=>key.includes('באיזו מדינה')));
});
