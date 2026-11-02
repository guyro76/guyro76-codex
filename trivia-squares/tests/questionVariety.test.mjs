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

test('a topic never comes back within three questions while others are available',()=>{
 const topicsBank=[...Array.from({length:30},(_,i)=>music(i)),...Array.from({length:30},(_,i)=>film(i)),
  ...Array.from({length:30},(_,i)=>({id:30000+i,category:'ספורט',text:'כמה שחקנים יש בקבוצה מספר '+i+'?'})),
  ...Array.from({length:30},(_,i)=>({id:40000+i,category:'מדע',text:'מהי היחידה של גודל מספר '+i+'?'})),
  ...Array.from({length:30},(_,i)=>({id:50000+i,category:'היסטוריה',text:'באיזו שנה קרה אירוע מספר '+i+'?'}))];
 let pool=[...topicsBank];const topics=[];
 let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 for(let d=0;d<30;d++){const c=selectVariedQuestion(pool,topics,rnd);topics.push(c.topic);pool=pool.filter(q=>q!==c.question)}
 for(let i=0;i+4<=topics.length;i++)assert.equal(new Set(topics.slice(i,i+4)).size,4,'repeat in '+topics.slice(i,i+4));
});

test('owner rule: one geography question, then at least seven other questions before the next one',()=>{
 const pool0=[...Array.from({length:60},(_,i)=>city(i)),...Array.from({length:40},(_,i)=>music(i)),...Array.from({length:40},(_,i)=>film(i)),
  ...Array.from({length:40},(_,i)=>({id:60000+i,category:'ספורט',text:'שאלת ספורט '+i+'?'})),
  ...Array.from({length:40},(_,i)=>({id:70000+i,category:'מדע',text:'שאלת מדע '+i+'?'})),
  ...Array.from({length:40},(_,i)=>({id:80000+i,category:'היסטוריה',text:'שאלת היסטוריה '+i+'?'}))];
 let pool=[...pool0];const topics=[];const geo=[];
 let seed=5;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 for(let d=0;d<40;d++){const c=selectVariedQuestion(pool,topics,rnd);topics.push(c.topic);geo.push(isGeographyQuestion(c.question));pool=pool.filter(q=>q!==c.question)}
 for(let i=0;i<geo.length;i++)assert.ok(geo.slice(i,i+8).filter(Boolean).length<=1,'two geography questions within 8 at '+i);
});
