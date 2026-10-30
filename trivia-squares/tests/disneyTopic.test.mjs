import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_QUESTION_TOPICS,questionTopics,topicForQuestion,parseTopicPreferences} from '../src/lib/questionTopics.ts';
import {readRecentQuestionTopics,selectVariedQuestion} from '../src/lib/questionMix.ts';

test('Disney is a separately selectable, native category in all six languages',()=>{
 const disney=questionTopics.find(topic=>topic.id==='disney');
 assert.ok(disney);
 for(const lang of ['he','en','ru','fr','ar','es'])assert.ok(disney[lang].length>=5,lang);
 assert.equal(questionTopics.length,15);
 assert.equal(ALL_QUESTION_TOPICS.filter(id=>id==='disney').length,1);
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
 assert.deepEqual(readRecentQuestionTopics(['disney','capitals','bogus']),['disney','capitals']);
});
test('variety engine rotates Disney and film questions separately',()=>{
 const q=[{category:'Films Disney',text:'Which Disney film?'},{category:'Movies',text:'Which comedy?'},{category:'Geography',text:'Which city?'}];
 const chosen=selectVariedQuestion(q,['tv_film'],()=>0);
 assert.ok(chosen);
 assert.equal(chosen.topic,'disney');
});
