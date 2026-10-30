import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questionTopics,ALL_QUESTION_TOPICS} from '../src/lib/questionTopics.ts';

test('community suggestion form uses the single source of truth for all 15 topics',()=>{
 const component=readFileSync('src/components/CommunityQuestionForm.tsx','utf8');
 assert.match(component,/import \{questionTopics\} from '\.\.\/lib\/questionTopics';/);
 assert.match(component,/questionTopics\.map\(t=>/);
 assert.equal(ALL_QUESTION_TOPICS.length,15);
 assert.equal(new Set(ALL_QUESTION_TOPICS).size,15);
 for(const id of ['disney','aviation','cars'])assert.ok(ALL_QUESTION_TOPICS.includes(id),id);
 for(const topic of questionTopics)for(const locale of ['he','en','ru','fr','ar','es']){
  assert.ok(topic[locale].trim().length>=3,topic.id+' '+locale);
 }
});
