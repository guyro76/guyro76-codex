import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineQuestions} from '../src/lib/offlineQuestions.ts';
import {englishQuestions} from '../src/lib/englishQuestions.ts';
import {internationalQuestions} from '../src/lib/internationalQuestions.ts';
import {spanishQuestions} from '../src/lib/spanishQuestions.ts';
import {languageQuestions} from '../src/lib/languageQuestions.ts';
import {freshLocalQuestionReserve} from '../src/lib/freshQuestions.ts';
import {curatedHebrewQuestions} from '../src/lib/curatedHebrewQuestions.ts';

/* Owner rule (2026-11-03): a question must never contain its own answer
 * ("What is the family name in Bridgerton?" -> "Bridgerton"). Ask about an inner detail instead. */
const norm=s=>String(s).toLowerCase().normalize('NFKD').replace(/[֑-ׇ̀-ͯ]/g,'')
 .replace(/["'׳״`’‘“”.,:;!?()\[\]\-–—/]/g,' ').replace(/\s+/g,' ').trim();
const stems=w=>{const out=new Set([w]);const m=w.match(/^(ו|ש|ה|ב|ל|מ|כ|וה|וב|ול|שה|מה|בה|לה|כש)(.{2,})$/);if(m)out.add(m[2]);return out};
const tokens=s=>norm(s).split(' ').filter(Boolean);
// Reviewed by hand: the overlap is only the category word ("Which ocean…? Indian Ocean")
// or a two-option comparison, so nothing is given away.
const REVIEWED_OK=new Set([56,1003,1006,1014,1031,1041,1044,1045,4013,4036,4048,301004,300036,90003,90055,90056,990095]);

export function answerLeak(text,answer){
 const nt=norm(text),na=norm(answer);
 if(!na||/^\d+([ .,]\d+)*$/.test(na))return '';
 const qt=new Set(tokens(text).flatMap(w=>[...stems(w)]));
 const at=tokens(answer).filter(w=>w.length>=3);
 if(na.length>=3&&(' '+nt+' ').includes(' '+na))return 'full answer in question';
 if(at.length&&at.every(w=>[...stems(w)].some(x=>qt.has(x))))return 'every answer word in question';
 for(const w of at.filter(w=>w.length>=4)){
  const sw=[...stems(w)].pop();
  for(const t of qt)if(t.length>=4&&sw.length>=4&&(t.startsWith(sw.slice(0,Math.max(4,sw.length-2)))||sw.startsWith(t.slice(0,Math.max(4,t.length-2)))))return 'answer word shares a stem with "'+t+'"';
 }
 return '';
}

test('no local question gives away its own answer',()=>{
 const all=[...offlineQuestions,...englishQuestions,...internationalQuestions,...spanishQuestions,...languageQuestions,...freshLocalQuestionReserve,...curatedHebrewQuestions];
 assert.ok(all.length>800);
 const leaks=[];
 for(const q of all){
  if(REVIEWED_OK.has(q.id))continue;
  const why=answerLeak(q.text,q.answers[q.correct]);
  if(why)leaks.push(q.id+': '+q.text+' -> '+q.answers[q.correct]+' ('+why+')');
 }
 assert.deepEqual(leaks,[]);
});

test('the leak check catches the owner examples',()=>{
 assert.ok(answerLeak("מהו שם המשפחה של הדמויות ברידג'רטון?","ברידג'רטון"));
 assert.ok(answerLeak('Where is Emily in Paris filmed?','Paris'));
 assert.equal(answerLeak("באמילי בפריז, איך קוראים לשף השכן של אמילי?",'גבריאל'),'');
});
