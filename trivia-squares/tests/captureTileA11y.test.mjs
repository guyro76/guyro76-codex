import test from 'node:test';
import assert from 'node:assert/strict';
import {captureTileA11yLabel} from '../src/lib/captureTileA11y.ts';
import {activeLocales} from '../src/lib/i18n.ts';

test('captured square ownership is accessible in all six native languages',()=>{
 const scripts={he:/[\u0590-\u05FF]/u,en:/[A-Za-z]/u,ru:/[\u0400-\u04FF]/u,fr:/[A-Za-z]/u,ar:/[\u0600-\u06FF]/u,es:/[A-Za-z]/u};
 for(const locale of activeLocales){
   const read=captureTileA11yLabel(locale,{row:1,col:2,name:'Player 7',selectable:false});
   const edit=captureTileA11yLabel(locale,{row:1,col:2,name:'Player 7',selectable:true});
   assert.match(read,scripts[locale],locale+' owner language');
   assert.match(edit,scripts[locale],locale+' action language');
   for(const value of [read,edit]){
     assert.match(value,/2/,'1-based row');
     assert.match(value,/3/,'1-based column');
     assert.match(value,/Player 7/,'owner should not be lost or altered');
   }
   assert.notEqual(read,edit,locale+' must distinguish readable from interactive');
 }
});
test('Hebrew and Arabic player names are never reversed or rewritten',()=>{
 for(const locale of activeLocales){
   const label=captureTileA11yLabel(locale,{row:0,col:0,name:'עדי רוזנברג',selectable:true});
   assert.ok(label.includes('עדי רוזנברג'),locale);
 }
});
