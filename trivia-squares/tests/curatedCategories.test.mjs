import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_QUESTION_TOPICS,topicForQuestion,parseTopicPreferences} from '../src/lib/questionTopics.ts';
import {curatedHebrewQuestions} from '../src/lib/curatedHebrewQuestions.ts';
import {findLocalQuestion} from '../src/lib/localQuestionLookup.ts';

test('owner-requested categories map to their own topics',()=>{
 const topics=new Set(curatedHebrewQuestions.map(q=>topicForQuestion(q.category,q.text)));
 for(const t of ['israel_geography','bible','israel_politics','arts','music','tv_film','general'])assert.ok(topics.has(t),t);
 // Israeli geography is never counted as capped world geography
 for(const q of curatedHebrewQuestions.filter(q=>q.category==='גאוגרפיה של ישראל'))assert.equal(topicForQuestion(q.category,q.text),'israel_geography');
});

test('every curated question is well formed, sourced, unique and answerable',()=>{
 const ids=new Set(),texts=new Set();
 for(const q of curatedHebrewQuestions){
  assert.equal(q.answers.length,4,q.text);
  assert.equal(new Set(q.answers).size,4,'duplicate answers: '+q.text);
  assert.ok(q.correct>=0&&q.correct<4,q.text);
  assert.match(q.sourceUrl,/^https:\/\/(he|en)\.wikipedia\.org\/wiki\//,q.text);
  assert.ok(!ids.has(q.id)&&!texts.has(q.text),'duplicate '+q.text);ids.add(q.id);texts.add(q.text);
  assert.equal(findLocalQuestion(q.id)?.correct,q.correct,'not answerable '+q.text);
 }
 assert.ok(curatedHebrewQuestions.length>=90);
});

test('players who had every topic selected in the 16-topic catalog also get the new topics',()=>{
 const catalog16=ALL_QUESTION_TOPICS.filter(t=>t!=='israel_geography'&&t!=='bible');
 assert.deepEqual(parseTopicPreferences(catalog16),ALL_QUESTION_TOPICS);
 assert.deepEqual(parseTopicPreferences(['music','bible']),['music','bible']);
});
