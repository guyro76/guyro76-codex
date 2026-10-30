import test from 'node:test';
import assert from 'node:assert/strict';
import { applyLocalAnswer, boardIsFilled, validEdge } from '../src/lib/engine.ts';

import {shouldOfferPremiumFollowUp} from '../src/lib/premiumCaptures.ts';

const fresh=()=>({rows:3,cols:3,mode:'local',turn:'host',edges:{},owners:{},scores:{host:0,guest:0,bot:0}});
test('invalid or remote dot edges cannot be placed',()=>{
 const initial=fresh();
 assert.equal(validEdge(initial,'h-3-3'),false);
 assert.equal(validEdge(initial,'v-3-0'),false);
 assert.equal(validEdge(initial,'h-0-1'),true);
 assert.equal(applyLocalAnswer(initial,'h-3-3',true),initial);
});
test('wrong answer leaves edge open and passes turn',()=>{
 const initial=fresh();
 const after=applyLocalAnswer(initial,'h-0-0',false);
 assert.deepEqual(after.edges,{});
 assert.equal(after.turn,'guest');
});
test('correct answer draws line and changes turn unless a box closes',()=>{
 const first=applyLocalAnswer(fresh(),'h-0-0',true);
 assert.equal(first.edges['h-0-0'],'host');
 assert.equal(first.turn,'guest');
 assert.equal(first.scores.host,0);
});
test('closing square gives point and extra turn',()=>{
 const s=fresh();
 s.edges={'h-0-0':'host','h-1-0':'host','v-0-0':'guest'};
 const after=applyLocalAnswer(s,'v-0-1',true);
 assert.equal(after.owners['0-0'],'host');
 assert.equal(after.scores.host,1);
 assert.equal(after.turn,'host');
 assert.equal(s.scores.host,0);
 assert.equal(s.owners['0-0'],undefined);
});
test('same edge can close two neighboring squares',()=>{
 const s=fresh();
 s.edges={
  'h-0-0':'host','h-1-0':'guest','v-0-0':'host',
  'h-0-1':'guest','h-1-1':'host','v-0-2':'guest'
 };
 const after=applyLocalAnswer(s,'v-0-1',true);
 assert.equal(after.scores.host,2);
 assert.equal(after.owners['0-0'],'host');
 assert.equal(after.owners['0-1'],'host');
 assert.equal(after.turn,'host');
});
test('taken edges are ignored',()=>{
 const s=fresh();s.edges={'h-0-0':'host'};
 assert.equal(applyLocalAnswer(s,'h-0-0',true),s);
});

test('finishing the final square suppresses any additional premium bonus question',()=>{
 const b=fresh();
 for(let r=0;r<=3;r++)for(let c=0;c<3;c++)b.edges['h-'+r+'-'+c]='host';
 for(let r=0;r<3;r++)for(let c=0;c<=3;c++)if(r!==2||c!==3)b.edges['v-'+r+'-'+c]='host';
 for(let r=0;r<3;r++)for(let c=0;c<3;c++)if(r!==2||c!==2)b.owners[r+'-'+c]='host';
 b.scores.host=8;
 const won=applyLocalAnswer(b,'v-2-3',true,true);
 assert.equal(won.owners['2-2'],'host');
 assert.equal(won.scores.host,9);
 assert.equal(boardIsFilled(won),true);
 assert.equal(shouldOfferPremiumFollowUp(won,true,true),false);
 assert.equal(applyLocalAnswer(won,'h-0-0',true,true),won);
 const unfinished=structuredClone(won);delete unfinished.owners['2-2'];
 assert.equal(shouldOfferPremiumFollowUp(unfinished,true,true),true);
});
test('extra legacy owner keys do not incorrectly finish a board',()=>{
 const b=fresh();
 b.owners=Object.fromEntries(Array.from({length:9},(_,i)=>['9-'+i,'host']));
 assert.equal(boardIsFilled(b),false);
});
