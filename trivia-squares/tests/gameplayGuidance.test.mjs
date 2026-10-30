import test from 'node:test';
import assert from 'node:assert/strict';
import {activeLocales} from '../src/lib/i18n.ts';
import {gameplayGuidance} from '../src/lib/gameplayGuidance.ts';

const actions=['drawAdjacent','chooseAdjacent','invalidKeyboardLine','answerTimedOut','extensionUsed','insufficientCredits','remoteExtensionGranted','localExtensionGranted'];
test('drawing, keyboard and timer feedback have native copy in all six locales',()=>{
 const script={he:/[\u0590-\u05FF]/u,en:/[a-z]/iu,ru:/[\u0400-\u04FF]/u,fr:/[a-zéàê]/iu,ar:/[\u0600-\u06FF]/u,es:/[a-záéó]/iu};
 for(const locale of activeLocales){
  for(const action of actions){
   const msg=gameplayGuidance(locale,action);
   assert.ok(msg.length>10,locale+' '+action);
   assert.match(msg,script[locale],locale+' '+action);
   assert.ok(!msg.includes('undefined'));
  }
  assert.match(gameplayGuidance(locale,'insufficientCredits'),/25/);
  assert.match(gameplayGuidance(locale,'localExtensionGranted'),/30/);
  assert.match(gameplayGuidance(locale,'localExtensionGranted'),/25/);
 }
});
