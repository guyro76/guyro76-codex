import test from 'node:test';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {CAMPAIGN_STAGES,STAGE_COUNT,stageFor,canOpenStage,nextUnlockedStage} from '../src/lib/campaignStages.ts';

test('two hundred unique stages in forty five-level chapters',()=>{
 assert.equal(STAGE_COUNT,200);
 assert.deepEqual(CAMPAIGN_STAGES.map(s=>s.id),Array.from({length:200},(_,i)=>i+1));
 assert.equal(new Set(CAMPAIGN_STAGES.map(s=>s.nameHe)).size,200);
 assert.equal(new Set(CAMPAIGN_STAGES.map(s=>s.nameEn)).size,200);
 assert.equal(new Set(CAMPAIGN_STAGES.map(s=>s.chapter)).size,40);
 for(const s of CAMPAIGN_STAGES){
  assert.ok(s.size>=3 && s.size<=6);
  assert.ok(['orchard','crystal','clouds','galaxy'].includes(s.theme));
  assert.ok(s.icon&&s.nameHe&&s.nameEn&&s.subtitleHe&&s.subtitleEn);
  assert.equal(stageFor(s.id).id,s.id);
 }
});
test('the stage unlock rules never skip ahead and never switch away from unfinished stage',()=>{
 assert.equal(canOpenStage(1,0,1,false),true);
 assert.equal(canOpenStage(2,0,1,true),false);
 assert.equal(canOpenStage(2,1,1,false),false);
 assert.equal(canOpenStage(2,1,1,true),true);
 assert.equal(canOpenStage(3,1,1,true),false);
 assert.equal(canOpenStage(100,98,99,true),false);
 assert.equal(canOpenStage(100,99,99,true),true);
 assert.equal(canOpenStage(101,100,100,true),true);
 assert.equal(canOpenStage(201,200,200,true),false);
 assert.equal(canOpenStage(0,0,1,true),false);
 assert.equal(nextUnlockedStage(1,0),null);
 assert.equal(nextUnlockedStage(1,1),2);
 assert.equal(nextUnlockedStage(100,100),101);
 assert.equal(nextUnlockedStage(200,200),null);
});

test('existing stage 9 remains unchanged, all new chapters consist of five stages',()=>{
 assert.equal(stageFor(9).nameHe,'מקדש האמטיסט');
 assert.equal(stageFor(9).size,5);
 assert.equal(stageFor(9).chapter,2);
 assert.equal(stageFor(31).chapter,7);
 assert.equal(stageFor(100).chapter,20);
 assert.equal(stageFor(200).chapter,40);
 for(let chapter=1;chapter<=20;chapter++){
  assert.equal(CAMPAIGN_STAGES.filter(s=>s.chapter===chapter).length,5);
 }
 assert.equal(canOpenStage(10,8,9,false),false);
 assert.equal(canOpenStage(10,9,9,true),true);
});

// Regression: after stage 100 the reward screen must still offer the next stage.
// A previous hard-coded <100 condition showed the 200-stage completion message too early.
test('stage reward advances through 199 and ends only at STAGE_COUNT',()=>{
 const reward=readFileSync(new URL('../src/components/StageReward.tsx',import.meta.url),'utf8');
 assert.equal(STAGE_COUNT,200);
 assert.equal(nextUnlockedStage(100,100),101);
 assert.equal(nextUnlockedStage(199,199),200);
 assert.equal(nextUnlockedStage(200,200),null);
 assert.match(reward,/stageNumber\s*<\s*STAGE_COUNT\s*\?/);
 assert.doesNotMatch(reward,/stageNumber\s*<\s*100\b/);
});
