import test from 'node:test';
import assert from 'node:assert/strict';
import {selectVariedQuestion,withRecycledVariety,isGeographyQuestion} from '../src/lib/questionMix.ts';

const canon=t=>t.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const city=i=>({id:i,category:'גאוגרפיה',text:'באיזו מדינה נמצאת העיר '+i+'?'});
const music=i=>({id:10000+i,category:'מוזיקה ישראלית',text:'מי שר את השיר מספר '+i+'?'});
const film=i=>({id:20000+i,category:'קולנוע',text:'באיזה סרט מופיעה הדמות '+i+'?'});

test('city rows are classified as geography',()=>{
 assert.equal(isGeographyQuestion(city(1)),true);
 assert.equal(isGeographyQuestion(music(1)),false);
});

test('when only city questions are unseen, old varied questions are recycled',()=>{
 const unseen=Array.from({length:100},(_,i)=>city(i));
 const bank=[...Array.from({length:30},(_,i)=>music(i)),...Array.from({length:30},(_,i)=>film(i)),...unseen];
 const seenOrder=[...bank.slice(0,60).map(q=>canon(q.text))];
 const pool=withRecycledVariety(unseen,bank,seenOrder,canon,10);
 const extra=pool.slice(unseen.length);
 assert.ok(extra.length>0);
 assert.ok(extra.every(q=>!isGeographyQuestion(q)));
 // oldest seen first, the 10 most recent are protected
 assert.equal(extra[0].text,music(0).text);
 for(const q of bank.slice(50,60))assert.ok(!extra.includes(q),'recent question recycled: '+q.text);
});

test('variety pool is untouched when unseen already has non-geography questions',()=>{
 const unseen=[city(1),music(1)];
 assert.deepEqual(withRecycledVariety(unseen,[music(2)],[],canon),unseen);
});

test('20 draws from a city-only unseen pool contain at most one geography question in any four',()=>{
 const unseen=Array.from({length:200},(_,i)=>city(i));
 const bank=[...Array.from({length:40},(_,i)=>music(i)),...Array.from({length:40},(_,i)=>film(i)),...unseen];
 let seen=bank.slice(0,80).map(q=>canon(q.text));
 let remaining=[...unseen];const topics=[];const kinds=[];
 let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 for(let draw=0;draw<20;draw++){
  const pool=withRecycledVariety(remaining,bank,seen,canon,20);
  const chosen=selectVariedQuestion(pool,topics,rnd);
  topics.push(chosen.topic);kinds.push(isGeographyQuestion(chosen.question));
  const key=canon(chosen.question.text);seen=[...seen.filter(t=>t!==key),key];
  remaining=remaining.filter(q=>q!==chosen.question);
 }
 for(let i=0;i+4<=kinds.length;i++)assert.ok(kinds.slice(i,i+4).filter(Boolean).length<=1,'window '+i+': '+kinds.slice(i,i+4));
});
