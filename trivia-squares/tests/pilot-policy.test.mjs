import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('launch pilot cannot silently start billing or advertising',async()=>{
 const policy=await readFile(new URL('../src/lib/pilotPolicy.ts',import.meta.url),'utf8');
 for(const key of ['billingEnabled','subscriptionsEnabled','lifetimePurchaseEnabled','advertisingEnabled','personalizedAdsEnabled','paywallEnabled','commercialOffersVisible','storeCheckoutEnabled']){
  assert.match(policy,new RegExp('\\b'+key+':false\\b'),key+' must remain false until commercial release');
 }
 assert.match(policy,/evaluationDays:5/);
 assert.match(policy,/expiresForPlayers:false/);
 assert.match(policy,/restrictLevels:false/);
 assert.match(policy,/BUSINESS_MODEL:BusinessModel='unselected'/);
});

test('pilot PWA has a single canonical start path, scope and icon',async()=>{
 const manifest=await readFile(new URL('../src/app/manifest.ts',import.meta.url),'utf8');
 assert.match(manifest,/start_url:'\/'/);
 assert.match(manifest,/scope:'\/'/);
 assert.match(manifest,/display:'standalone'/);
 assert.match(manifest,/src:'\/icon.svg'/);
 const icon=await readFile(new URL('../src/app/icon.svg',import.meta.url),'utf8');
 assert.match(icon,/viewBox="0 0 192 192"/);
});
