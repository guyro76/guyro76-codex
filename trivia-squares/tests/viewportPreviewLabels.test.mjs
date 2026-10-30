import test from 'node:test';
import assert from 'node:assert/strict';
import {activeLocales} from '../src/lib/i18n.ts';
import {viewportModeLabel,viewportPreviewLabel} from '../src/lib/viewportPreviewLabels.ts';

test('all four viewport controls are labeled in the active language',()=>{
 const scripts={he:/[\u0590-\u05FF]/u,en:/[a-z]/iu,ru:/[\u0400-\u04FF]/u,fr:/[a-z]/iu,ar:/[\u0600-\u06FF]/u,es:/[a-záéó]/iu};
 for(const lang of activeLocales){
  const options=['auto','desktop','tablet','mobile'].map(mode=>viewportModeLabel(lang,mode));
  assert.equal(new Set(options).size,4,'Four distinct labels for '+lang);
  for(const label of [...options,viewportPreviewLabel(lang)]){
   assert.match(label,scripts[lang],lang+' native text');
   assert.ok(label.length>0);
  }
 }
});
test('Hebrew existing device-preview labels remain unchanged for familiar navigation',()=>{
 assert.equal(viewportModeLabel('he','desktop'),'מחשב');
 assert.equal(viewportModeLabel('he','tablet'),'טאבלט');
 assert.equal(viewportModeLabel('he','mobile'),'נייד');
});
