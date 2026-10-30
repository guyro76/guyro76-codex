import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {CAMPAIGN_STAGES,STAGE_COUNT,canOpenStage} from '../src/lib/campaignStages.ts';
import {questionTopics,ALL_QUESTION_TOPICS} from '../src/lib/questionTopics.ts';
import {selectVariedQuestion} from '../src/lib/questionMix.ts';
import {intermissionMiniText} from '../src/lib/intermissionLocales.ts';
import {PILOT_POLICY} from '../src/lib/pilotPolicy.ts';
const src=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const exists=path=>access(new URL('../'+path,import.meta.url));
const languages=['he','en','ru','fr','ar','es'];

test('QA 01 - campaign has exactly 100 sequential levels',()=>{
 assert.equal(STAGE_COUNT,100);
 assert.deepEqual(CAMPAIGN_STAGES.map(s=>s.id),Array.from({length:100},(_,i)=>i+1));
 assert.ok(CAMPAIGN_STAGES.every(s=>s.size>=3&&s.size<=6));
});
test('QA 02 - twenty navigable chapters of five stages each',()=>{
 const groups=Map.groupBy(CAMPAIGN_STAGES,s=>s.chapter);
 assert.equal(groups.size,20);
 assert.ok([...groups.values()].every(stages=>stages.length===5));
});
test('QA 03 - prior saved progress stage nine cannot jump ahead',()=>{
 const s=CAMPAIGN_STAGES[8];
 assert.equal(s.id,9);assert.equal(s.size,5);
 assert.equal(canOpenStage(10,8,9,false),false);
 assert.equal(canOpenStage(10,9,9,true),true);
 assert.equal(canOpenStage(11,9,9,true),false);
});
test('QA 04 - six languages include complete topic taxonomy',()=>{
 assert.equal(questionTopics.length,14);
 assert.deepEqual(ALL_QUESTION_TOPICS,questionTopics.map(t=>t.id));
 for(const t of questionTopics)for(const lang of languages)assert.ok(t[lang]?.length>1,lang+' '+t.id);
});
test('QA 05 - six painter palette skins exist, including purple orange future',async()=>{
 const game=await src('src/app/game.tsx');
 for(const skin of ['regular','urban','vintage','retro','pop','future'])
  assert.match(game,new RegExp("id:'"+skin+"'"));
 assert.match(game,/AI · סגול כתום/);
});
test('QA 06 - all four intermission choices are present and localized',async()=>{
 const reward=await src('src/components/StageReward.tsx');
 for(const mode of ['wheel','word','balloons','cake'])assert.ok(reward.includes("game==='"+mode+"'")||reward.includes("setGame('"+mode+"')"),mode);
 for(const lang of languages)assert.ok(intermissionMiniText(lang,'cakeTitle')&&intermissionMiniText(lang,'balloonsTitle'));
});
test('QA 07 - earned credits are saved and restored, never silently zeroed by default',async()=>{
 const game=await src('src/app/game.tsx');
 assert.match(game,/savedRewardSnapshot/);
 assert.match(game,/trivia-local-rewards/);
 assert.match(game,/onLocalPrize=\{stageLocalReward\}/);
});
test('QA 08 - liquid fill and player name are readable with accessible motion fallback',async()=>{
 const tile=await src('src/components/CaptureTile.tsx');
 const css=await src('src/app/premium.css');
 assert.match(tile,/capture-liquid-rise/);
 assert.match(tile,/capture-player-name-object/);
 assert.match(css,/@keyframes captureVesselFill/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test('QA 09 - mobile install covers iOS and Android, with no new paid service',async()=>{
 for(const p of ['src/app/apple-icon.png','public/icon-192.png','public/icon-512.png','src/app/manifest.ts'])await exists(p);
 const manifest=await src('src/app/manifest.ts');
 assert.match(manifest,/display:'standalone'/);
 assert.match(manifest,/icon-192\.png/);
 assert.match(manifest,/icon-512\.png/);
 for(const prop of ['billingEnabled','advertisingEnabled','paywallEnabled','storeCheckoutEnabled'])
  assert.equal(PILOT_POLICY[prop],false);
});
test('QA 10 - question mixing does not select mostly cities when other topics exist',()=>{
 const items=[...Array.from({length:5000},(_,i)=>({category:'Geography',text:'Which city is no '+i+'?'})),
 {category:'Movies',text:'Which film is famous?'},{category:'Music',text:'Which singer?'},{category:'History',text:'Which historical event?'},
 {category:'Science',text:'Which experiment?'},{category:'Sports',text:'Which football team?'}];
 const recent=[];for(let i=0;i<35;i++){
  const r=selectVariedQuestion(items,recent,()=>i/35);
  assert.ok(r);
  if(r.topic==='capitals')assert.ok(!recent.slice(-3).includes('capitals'),'only one city question per four');
  recent.push(r.topic);
 }
 const geo=recent.filter(t=>t==='capitals').length;
 assert.ok(geo<=9,'too much geographic concentration');
});
