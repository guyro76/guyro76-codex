import test from 'node:test';
import assert from 'node:assert/strict';
import {capturePreviewCopy} from '../src/lib/capturePreviewCopy.ts';
import {activeLocales} from '../src/lib/i18n.ts';

test('liquid demonstration provides bold UI labels and replay in all native locales',()=>{
 for(const locale of activeLocales){
  const t=capturePreviewCopy[locale];
  assert.ok(t.open.length>4,locale+' open');
  assert.ok(t.title.length>4,locale+' title');
  assert.ok(t.hint.length>15,locale+' hint');
  assert.ok(t.again.length>3,locale+' replay');
  assert.ok(t.close.length>2,locale+' close');
 }
});
