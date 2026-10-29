import test from 'node:test';
import assert from 'node:assert/strict';
import {localeCatalog,activeLocales,plannedLocales,isActiveLocale,localeDirection,translate,translatedWorlds,englishDictionary} from '../src/lib/i18n.ts';
import {offlineQuestions} from '../src/lib/offlineQuestions.ts';
import {englishQuestions} from '../src/lib/englishQuestions.ts';

test('QA: five languages are all enabled; Hebrew and Arabic render RTL',()=>{
 assert.deepEqual([...activeLocales],['he','en','ru','fr','ar']);
 assert.deepEqual([...plannedLocales],[]);
 for(const locale of activeLocales){
  assert.equal(isActiveLocale(locale),true);
  assert.equal(localeCatalog[locale].enabled,true);
  assert.equal(translatedWorlds[locale].length,4);
  assert.ok(translate(locale,'טריוויה ריבועים').trim());
 }
 for(const locale of ['he','ar'])assert.equal(localeDirection(locale),'rtl');
 for(const locale of ['en','ru','fr'])assert.equal(localeDirection(locale),'ltr');
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
