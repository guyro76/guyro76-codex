import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalTriviaDestination} from '../src/lib/canonicalOrigin.ts';

test('production deployment links use one persistent Safari origin, preserving room invites',()=>{
 assert.equal(
  canonicalTriviaDestination('https://trivia-squares-bw1cot48a-guy-rosenberg-s-projects.vercel.app/?room=abc&lang=he'),
  'https://trivia-squares.vercel.app/?room=abc&lang=he');
 assert.equal(canonicalTriviaDestination('https://trivia-squares-ir00pkaf7-guy-rosenberg-s-projects.vercel.app/account?from=game#settings'),
  'https://trivia-squares.vercel.app/account?from=game#settings');
});
test('canonical, localhost, unrelated domains and explicit preview QA never redirect',()=>{
 for(const url of [
  'https://trivia-squares.vercel.app/',
  'http://127.0.0.1:3210/',
  'https://another-project.vercel.app/',
  'https://trivia-squares-abc-guy-rosenberg-s-projects.vercel.app/?qa-preview=1',
  'not a url'
 ])assert.equal(canonicalTriviaDestination(url),null,url);
});
