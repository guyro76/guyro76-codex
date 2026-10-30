import test from 'node:test';
import assert from 'node:assert/strict';
import {selectVariedQuestion,readRecentQuestionTopics} from '../src/lib/questionMix.ts';

test('a 5,000-city bank never overwhelms fresh films, music, science and sports questions',()=>{
 const cities=Array.from({length:5000},(_,i)=>({
   category:'גאוגרפיה',text:'באיזו עיר נמצא המוזיאון מספר '+i+'?'
 }));
 const others=[
  {category:'קולנוע',text:'איזה סרט מתרחש בממלכת ארנדל?'},
  {category:'מוזיקה',text:'איזה זמר הוציא את השיר החדש?'},
  {category:'מדע',text:'איזה כוכב לכת גדול יותר?'},
  {category:'ספורט',text:'איזו נבחרת זכתה באליפות?'}
 ];
 let pool=[...cities,...others],recent=[],topics=[];
 for(let i=0;i<20;i++){
   const selected=selectVariedQuestion(pool,recent,()=>.1);
   assert.ok(selected);
   topics.push(selected.topic);
   recent=[...recent,selected.topic].slice(-8);
   pool=pool.filter(q=>q!==selected.question);
 }
 assert.ok(topics.filter(t=>t==='capitals').length<=5,'no more than one city question in any four');
 assert.ok(new Set(topics).size>=4,'the stage must include at least four topics');
 for(let i=0;i<topics.length-3;i++){
   assert.ok(topics.slice(i,i+4).filter(t=>t==='capitals').length<=1);
 }
});

test('single-topic fallback keeps gameplay available instead of gifting free lines',()=>{
 const q=[{category:'גאוגרפיה',text:'באיזו עיר נמצאת אנדרטה?'}];
 const got=selectVariedQuestion(q,['capitals','capitals','capitals'],()=>0);
 assert.equal(got?.question,q[0]);
 assert.equal(got?.topic,'capitals');
 assert.equal(selectVariedQuestion([],[],()=>0),null);
});

test('recent topic history is bounded and rejects invalid stored data',()=>{
 assert.deepEqual(readRecentQuestionTopics(null),[]);
 assert.deepEqual(readRecentQuestionTopics(['capitals','fake','music']),['capitals','music']);
 assert.equal(readRecentQuestionTopics(Array(40).fill('music')).length,8);
});

test('first turn honors a topic-restricted question pool without geography override',()=>{
 const available=[
  {category:'גאוגרפיה',text:'מהי בירת אוסטרליה?'},
  {category:'מוזיקה',text:'מי שר את שיר הנושא?'}
 ];
 const preferred=available.filter(q=>q.category==='מוזיקה');
 const choice=selectVariedQuestion(preferred,[],()=>0);
 assert.equal(choice?.topic,'music');
 assert.equal(choice?.question,preferred[0]);
});
