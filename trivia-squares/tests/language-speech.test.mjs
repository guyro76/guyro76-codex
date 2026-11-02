import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const speech=readFileSync(join(process.cwd(),'src/lib/languageSpeech.ts'),'utf8');
const bank=readFileSync(join(process.cwd(),'src/lib/languageQuestions.ts'),'utf8');
const languages=JSON.parse(speech.match(/export const spokenLanguages=(\[[^;]+\]) as const;/)[1].replaceAll("'",'"'));
const questions=JSON.parse(bank.match(/export const languageQuestions:LanguageQuestion\[\]=(\[[\s\S]*\]);/)[1]);

test('all language questions map to a target speech locale',()=>{
 assert.equal(languages.length,questions.length);
 for(let i=0;i<questions.length;i++){
  assert.equal(questions[i].id,970000+i);
  assert.match(languages[i],/^(?:en|es|fr|it)$/);
 }
});
test('speech playback requires a voice matching the target language',()=>{
 assert.match(speech,/if\(!voice\)return false/);
 assert.match(speech,/utterance\.voice=voice/);
});
test('speaker button does not answer the question',()=>{
 const game=readFileSync(join(process.cwd(),'src/app/game.tsx'),'utf8');
 assert.match(game,/className='language-speaker'/);
 assert.match(game,/event\.stopPropagation\(\)/);
 assert.match(game,/speakLanguageAnswer\(a,lang\)/);
});
