import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_QUESTION_TOPICS,questionTopics,topicForQuestion,parseTopicPreferences} from '../src/lib/questionTopics.ts';
import {readRecentQuestionTopics,selectVariedQuestion} from '../src/lib/questionMix.ts';

test('Disney is a separately selectable, native category in all six languages',()=>{
 const disney=questionTopics.find(topic=>topic.id==='disney');
 assert.ok(disney);
 for(const lang of ['he','en','ru','fr','ar','es'])assert.ok(disney[lang].length>=5,lang);
 assert.equal(questionTopics.length,18);
 assert.equal(ALL_QUESTION_TOPICS.filter(id=>id==='disney').length,1);
});
test('previous all-selected preferences gain Languages without changing narrow selections',()=>{
 const CATALOG_16=ALL_QUESTION_TOPICS.filter(id=>id!=='israel_geography'&&id!=='bible');
 const allBeforeLanguages=CATALOG_16.filter(id=>id!=='languages');
 assert.equal(allBeforeLanguages.length,15);
 assert.deepEqual(parseTopicPreferences(allBeforeLanguages),ALL_QUESTION_TOPICS);
 const beforeDisneyAndLanguages=allBeforeLanguages.filter(id=>id!=='disney');
 assert.deepEqual(parseTopicPreferences(beforeDisneyAndLanguages),ALL_QUESTION_TOPICS);
 const beforeEurovisionDisneyLanguages=beforeDisneyAndLanguages.filter(id=>id!=='eurovision');
 assert.deepEqual(parseTopicPreferences(beforeEurovisionDisneyLanguages),ALL_QUESTION_TOPICS);
 assert.deepEqual(parseTopicPreferences(['music','tv_film']),['tv_film','music']);
});
test('Disney questions classify correctly without absorbing unrelated films',()=>{
 for(const [category,text] of [
  ['סרטי דיסני','מי הגיבורה?'],['Films Disney','Quel est le film ?'],
  ['Фильмы Диснея','Главный герой?'],['أفلام ديزني','ما اسم الفيلم؟'],
  ['Películas de Disney','¿Quién protagoniza?'],['Disney movies','Who is the hero?']
 ])assert.equal(topicForQuestion(category,text),'disney',category);
 assert.equal(topicForQuestion('Movies','Which film won?'),'tv_film');
 assert.equal(topicForQuestion('סדרות','מי שיחק בסדרה?'),'tv_film');
});
test('old player preferences are respected and newly created profiles see all topics',()=>{
 assert.ok(parseTopicPreferences(null).includes('disney'));
 const selected=['tv_film','music','history'];
 assert.deepEqual(parseTopicPreferences(selected),selected);
 assert.ok(!parseTopicPreferences(selected).includes('disney'));
 const previouslyAll=ALL_QUESTION_TOPICS.filter(id=>id!=='disney'&&id!=='israel_geography'&&id!=='bible');
 assert.deepEqual(parseTopicPreferences(previouslyAll),ALL_QUESTION_TOPICS,
  'previously all-selected players receive the new Disney topic');
 const previouslyAllBeforeEuro=previouslyAll.filter(id=>id!=='eurovision');
 assert.deepEqual(parseTopicPreferences(previouslyAllBeforeEuro),ALL_QUESTION_TOPICS,
  'pre-Eurovision all-selected players receive both added categories');
 assert.deepEqual(readRecentQuestionTopics(['disney','capitals','bogus']),['disney','capitals']);
});
test('variety engine rotates Disney and film questions separately',()=>{
 const q=[{category:'Films Disney',text:'Which Disney film?'},{category:'Movies',text:'Which comedy?'},{category:'Geography',text:'Which city?'}];
 const chosen=selectVariedQuestion(q,['tv_film'],()=>0);
 assert.ok(chosen);
 assert.equal(chosen.topic,'disney');
});
