import test from 'node:test';
import assert from 'node:assert/strict';
import {historyEntry,selectBalancedQuestion} from '../src/lib/questionDiversity.ts';
import {ALL_QUESTION_TOPICS} from '../src/lib/questionTopics.ts';

const geo=Array.from({length:5000},(_,i)=>({id:i+1,category:'גאוגרפיה',text:'באיזו עיר נמצאת תחנת '+i+'?'}));
const topics=[
 ['מוזיקה ישראלית','מי שר את השיר שלום?'],
 ['קולנוע','איזה סרט זכה בפרס?'],
 ['ספורט','מי זכה באליפות?'],
 ['מדע','איזה כוכב לכת קרוב?'],
 ['היסטוריה','מי הוביל את המהפכה?'],
 ['טבע','איזו ציפור מטילה ביצים?'],
 ['אירוויזיון','מי ייצג את המדינה באירוויזיון?']
].map(([category,text],i)=>({id:6000+i,category,text}));

test('Five thousand city-location questions cannot occupy an entire 5x5 stage when seven other topics are available',()=>{
 const bank=[...geo,...topics];
 const used=new Set(),history=[];
 for(let i=0;i<25;i++){
  const q=selectBalancedQuestion(bank.filter(x=>!used.has(x.id)),history,ALL_QUESTION_TOPICS,()=>.5);
  assert.ok(q);used.add(q.id);history.push(historyEntry(q));
 }
 const uniqueTopics=new Set(history.map(x=>x.topic));
 assert.ok(uniqueTopics.size>=6,'Must expose multiple topics within a single stage');
 assert.ok(history.filter(x=>x.topic==='capitals').length<=8,'No city-only stage');
 assert.notEqual(history[0].topic,history[1].topic,'Do not open with two identical subjects');
});

test('A manually selected single topic is respected, without skipping questions',()=>{
 const history=[];
 for(let i=0;i<3;i++){
  const q=selectBalancedQuestion([...geo.slice(0,3),...topics],history,['capitals'],()=>0);
  assert.ok(q);
  assert.equal(historyEntry(q).topic,'capitals');
  history.push(historyEntry(q));
 }
});

test('A different language pool is independently balanced and still respects chosen subjects',()=>{
 const bank=[
  {id:1,category:'Geography',text:'Where is Town A located?'},
  {id:2,category:'Geography',text:'Where is Town B located?'},
  {id:3,category:'Movies',text:'Which actor played the lead role?'},
  {id:4,category:'Science and nature',text:'Which element has the symbol Fe?'}
 ];
 const history=[];
 for(let i=0;i<3;i++){
  const q=selectBalancedQuestion(bank.filter(x=>!history.some(h=>h.category===x.category&&h.pattern===x.text)),history,ALL_QUESTION_TOPICS,()=>0);
  assert.ok(q);
  history.push(historyEntry(q));
 }
 assert.ok(history.some(x=>x.topic==='tv_film'));
});
