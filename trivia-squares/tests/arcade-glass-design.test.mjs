import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const css=readFileSync(join(process.cwd(),'src/app/arcade-polish.css'),'utf8');
const game=readFileSync(join(process.cwd(),'src/app/game.tsx'),'utf8');
test('premium glass layer is loaded by the game',()=>{
 assert.match(game,/import '\.\/arcade-polish\.css'/);
 assert.match(css,/backdrop-filter:blur/);
 assert.match(css,/\.arena-panel/);
});
test('answer choices and speaker have accessible target sizing',()=>{
 assert.match(css,/\.answer-option\{[\s\S]*?min-height:52px/);
 assert.match(css,/\.language-speaker\{[\s\S]*?min-height:48px/);
});
test('design honors reduced motion, focus, forced colors and narrow viewports',()=>{
 for(const marker of ['prefers-reduced-motion:reduce','focus-visible','forced-colors:active','max-width:819px','max-width:380px'])assert.ok(css.includes(marker),marker);
});
