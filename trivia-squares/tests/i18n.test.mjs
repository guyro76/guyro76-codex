import test from 'node:test';
import assert from 'node:assert/strict';
import {extraDictionaries} from '../src/lib/i18nExtra.ts';
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

// Check every literal tr('...') key in game components, not just a hand-picked list.
test('QA: all literal game controls and answer-feedback strings are localized',async()=>{
 const {readFileSync}=await import('node:fs');
 const sources=['../src/app/game.tsx','../src/components/StageReward.tsx','../src/components/TutorialPreview.tsx'];
 const keys=new Set();
 const matcher=/\btr\(\s*(['"])([^'"\n]{2,150})\1\s*\)/g;
 for(const file of sources){
  const content=readFileSync(new URL(file,import.meta.url),'utf8');
  for(const match of content.matchAll(matcher))if(/[\u0590-\u05ff]/u.test(match[2]))keys.add(match[2]);
 }
 assert.ok(keys.size>=80,'Translation guard did not detect expected controls');
 for(const key of keys)for(const locale of ['en','ru','fr','ar']){
  const translated=translate(locale,key);
  if(locale!=='en')assert.ok(Object.hasOwn(extraDictionaries[locale],key),'Missing native '+locale+' translation for: '+key);
  else assert.ok(Object.hasOwn(englishDictionary,key),'Missing English translation for: '+key);
  // The Hebrew option in the language picker intentionally uses its native script.
  if(key!=='עברית')assert.ok(!/[\u0590-\u05ff]/u.test(translated),'Untranslated control in '+locale+': '+key);
 }
});

test('QA: static stage and setup labels never fall back to Hebrew in other locales',async()=>{
 const {readFileSync}=await import('node:fs');
 const game=readFileSync(new URL('../src/app/game.tsx',import.meta.url),'utf8');
 const legacy=[...game.matchAll(/locale==='en'\?'([^']*)':'([^']*)'/g)]
   .filter(match=>!match[1].startsWith('/en/'));
 assert.equal(legacy.length,0,'Use tr() for text in all supported languages, not a two-locale ternary');
});

test('QA: thirty stage titles and subtitles are native in every active language',async()=>{
 const {CAMPAIGN_STAGES}=await import('../src/lib/campaignStages.ts');
 assert.equal(CAMPAIGN_STAGES.length,30);
 for(const stage of CAMPAIGN_STAGES)for(const key of ['nameHe','subtitleHe']){
   const label=stage[key];
   assert.ok(Object.hasOwn(englishDictionary,label),'Missing English stage text: '+label);
   for(const locale of ['ru','fr','ar']){
     assert.ok(Object.hasOwn(extraDictionaries[locale],label),'Missing '+locale+' stage text: '+label);
     assert.ok(!/[\u0590-\u05ff]/.test(translate(locale,label)),'Hebrew leaked to '+locale+' stage');
   }
 }
});
