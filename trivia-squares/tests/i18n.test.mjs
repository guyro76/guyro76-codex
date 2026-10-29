import test from 'node:test';
import assert from 'node:assert/strict';
import {localeCatalog,activeLocales,plannedLocales,isActiveLocale,localeDirection,translate,translatedWorlds,englishDictionary} from '../src/lib/i18n.ts';
import {offlineQuestions} from '../src/lib/offlineQuestions.ts';
import {englishQuestions} from '../src/lib/englishQuestions.ts';

test('QA specialist 4: English and Hebrew released, other language gates disabled',()=>{
 assert.deepEqual([...activeLocales],['he','en']);
 assert.deepEqual([...plannedLocales],['ru','fr','ar']);
 assert.equal(isActiveLocale('en'),true);
 assert.equal(isActiveLocale('ru'),false);
 assert.equal(isActiveLocale('fr'),false);
 assert.equal(isActiveLocale('ar'),false);
 for(const locale of plannedLocales)assert.equal(localeCatalog[locale].enabled,false);
 assert.equal(localeDirection('he'),'rtl');
 assert.equal(localeDirection('en'),'ltr');
 assert.equal(localeCatalog.ar.direction,'rtl');
});
test('QA specialist 4: English UI has authored primary strings',()=>{
 for(const input of ['טריוויה ריבועים','התחל משחק','גודל לוח','התחבר באמצעות Google','שכחתי סיסמה','הודעת הפרטיות','תנאי השימוש','כינוי שחקן','פרטיות','נגישות','התחל משחק']){
  const result=translate('en',input);
  assert.ok(result, input);
  assert.notEqual(result,input,'Missing translated string: '+input);
 }
 assert.equal(translate('he','שם שחקן'),'שם שחקן');
 assert.equal(translatedWorlds.en.length,4);
 assert.equal(translatedWorlds.he.length,4);
 for(const [key,value] of Object.entries(englishDictionary)){
   assert.ok(key.trim(),'empty translation key');
   assert.ok(value.trim(),'missing English text for '+key);
 }
});
test('QA specialist 4: question locale is an independent English-first bank',()=>{
 assert.equal(englishQuestions.some(q=>/[\u0590-\u05FF]/.test(q.text)),false);
 assert.equal(offlineQuestions.every(q=>/[\u0590-\u05FF]/.test(q.text)),true);
 assert.ok(englishQuestions.some(q=>q.category==='Movies'));
 assert.ok(englishQuestions.some(q=>q.category==='Television'));
 assert.ok(englishQuestions.some(q=>q.category==='World music'));
 assert.ok(offlineQuestions.some(q=>q.category==='מוזיקה ישראלית'));
});
