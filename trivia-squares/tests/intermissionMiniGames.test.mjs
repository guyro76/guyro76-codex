import test from 'node:test';
import assert from 'node:assert/strict';
import {intermissionMiniText} from '../src/lib/intermissionLocales.ts';

const locales=['he','en','ru','fr','ar','es'];
const keys=['balloonsTitle','cakeTitle','balloonsSubtitle','cakeSubtitle','balloonsHelp','cakeHelp','popBalloon','sliceCake'];

test('all four intermission games have localized balloon and cake controls in every enabled language',()=>{
 for(const locale of locales){
  for(const key of keys){
   const value=intermissionMiniText(locale,key);
   assert.ok(value.length>=6,`${locale} ${key} must not be blank`);
   if(locale!=='he')assert.doesNotMatch(value,/[א-ת]/,`${locale} ${key} must not show Hebrew`);
  }
 }
 assert.equal(new Set(locales.map(l=>intermissionMiniText(l,'balloonsTitle'))).size,6);
 assert.equal(new Set(locales.map(l=>intermissionMiniText(l,'cakeTitle'))).size,6);
});
