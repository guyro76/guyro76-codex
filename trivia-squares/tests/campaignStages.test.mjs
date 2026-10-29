import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN_STAGES,STAGE_COUNT,stageFor,canOpenStage,nextUnlockedStage} from '../src/lib/campaignStages.ts';

test('thirty distinct stages with coherent geometry and six chapters',()=>{
 assert.equal(STAGE_COUNT,30);
 assert.deepEqual(CAMPAIGN_STAGES.map(s=>s.id),Array.from({length:30},(_,i)=>i+1));
 assert.equal(new Set(CAMPAIGN_STAGES.map(s=>s.nameHe)).size,30);
 assert.equal(new Set(CAMPAIGN_STAGES.map(s=>s.nameEn)).size,30);
 assert.equal(new Set(CAMPAIGN_STAGES.map(s=>s.chapter)).size,6);
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
 assert.equal(canOpenStage(30,28,29,true),false);
 assert.equal(canOpenStage(30,29,29,true),true);
 assert.equal(canOpenStage(31,30,30,true),false);
 assert.equal(canOpenStage(0,0,1,true),false);
 assert.equal(nextUnlockedStage(1,0),null);
 assert.equal(nextUnlockedStage(1,1),2);
 assert.equal(nextUnlockedStage(30,30),null);
});
