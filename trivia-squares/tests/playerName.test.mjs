import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizedPlayerName,selectPlayerName,validPlayerName} from '../src/lib/playerName.ts';

test('newly entered local nickname takes precedence over a stale online profile',()=>{
  assert.equal(selectPlayerName('  גיא  ','שם ישן'), 'גיא');
});
test('online profile is only used when there is no valid locally saved nickname',()=>{
  assert.equal(selectPlayerName(null,'משתמש ותיק'), 'משתמש ותיק');
  assert.equal(selectPlayerName('', 'שחקן ברשת'),'שחקן ברשת');
});
test('invalid names are not stored and 32 characters is enforced',()=>{
  assert.equal(validPlayerName(''),false);
  assert.equal(validPlayerName('א'),false);
  assert.equal(validPlayerName('שחקן'),false);
  assert.equal(validPlayerName('  מאיה  '),true);
  assert.equal(normalizedPlayerName('ט'.repeat(45)).length,32);
});
