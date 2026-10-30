import test from 'node:test';
import assert from 'node:assert/strict';
import {CATEGORIES,FACT_TEMPLATES,LANGUAGES,phraseFor} from '../scripts/crossword-topics.mjs';
import {
 verifySingleStatement,hasAllTranslations,introSupportsAnswer,
 makeUniqueAnswers,makeQuestions,auditCandidates
} from '../scripts/generate-crossword-trivia.mjs';

const entity=(id,label)=>({
 id,labels:Object.fromEntries(LANGUAGES.map(l=>[l,{language:l,value:label+'-'+l}]))
});
const claims=(answerId,rank='normal')=>[{
 rank,mainsnak:{snaktype:'value',datavalue:{value:{id:answerId}}}
}];

test('editor maintains 30 topic families and sources for multiple non-geography domains',()=>{
 assert.ok(CATEGORIES.length>=30);
 assert.ok(FACT_TEMPLATES.length>=15);
 for(const l of LANGUAGES)assert.ok(CATEGORIES.every(c=>c[l]?.length>=3));
 assert.ok(FACT_TEMPLATES.some(x=>x.category==='israel-politics'));
 assert.ok(FACT_TEMPLATES.some(x=>x.category==='world-cinema'));
 assert.ok(FACT_TEMPLATES.some(x=>x.category==='world-music'));
 assert.ok(FACT_TEMPLATES.some(x=>x.category==='books'));
});
test('single Wikidata statement must have unique current answer',()=>{
 const e={claims:{P57:claims('Q42')}};
 assert.equal(verifySingleStatement(e,'P57','Q42'),true);
 assert.equal(verifySingleStatement(e,'P57','Q43'),false);
 assert.equal(verifySingleStatement(e,'P58','Q42'),false);
 e.claims.P57.push(...claims('Q43'));
 assert.equal(verifySingleStatement(e,'P57','Q42'),false);
 e.claims.P57[1].rank='deprecated';
 assert.equal(verifySingleStatement(e,'P57','Q42'),true);
});
test('Wikipedia article must name the exact claimed answer, not another person',()=>{
 assert.equal(introSupportsAnswer('The film was directed by Christopher Nolan.','Christopher Nolan'),true);
 assert.equal(introSupportsAnswer('The film was directed by Christopher Nolan.','Steven Spielberg'),false);
 assert.equal(introSupportsAnswer('The author was Marie Curie-Sklodowska.','Marie Curie',['Marie Curie-Sklodowska']),true);
 assert.equal(introSupportsAnswer('The director was Stan Lee.','Lee'),true);
});
test('every language must have real source and answer labels, never Q IDs',()=>{
 const s=entity('Q10','Film'),a=entity('Q20','Director');
 assert.equal(hasAllTranslations(s,a),true);
 delete a.labels.ar;
 assert.equal(hasAllTranslations(s,a),false);
 assert.throws(()=>phraseFor('director','he','Q123'));
});
test('all options are unique, shuffled and include exactly the verified correct answer',()=>{
 const r=makeUniqueAnswers('Q10',['Q20','Q30','Q40','Q10','Q20'],'Q999');
 assert.ok(r);
 assert.equal(r.ids.length,4);
 assert.equal(new Set(r.ids).size,4);
 assert.equal(r.ids[r.correct_index],'Q10');
 assert.equal(makeUniqueAnswers('Q10',['Q20','Q30'],'Q999'),null);
});
test('every verified source fact makes one five-language question pack',()=>{
 const topic=FACT_TEMPLATES.find(t=>t.id==='film-director');
 const subject=entity('Q100','Movie'),answer=entity('Q200','Director');
 const options=[entity('Q300','Other A'),entity('Q400','Other B'),entity('Q500','Other C')];
 const source={wikidata:'https://www.wikidata.org/wiki/Q100#P57',
  wikipedia:'https://en.wikipedia.org/wiki/Movie',wikipediaRevision:123456};
 const result=makeQuestions(topic,subject,answer,options,source,'film-director:Q100:P57');
 assert.deepEqual(result.map(q=>q.locale),LANGUAGES);
 for(const q of result){
  assert.equal(q.answers.length,4);
  assert.equal(q.answers[q.correct_index],'Director-'+q.locale);
  assert.equal(q.editorialStatus,'pending_review');
  assert.ok(q.question.includes('Movie-'+q.locale));
 }
 assert.deepEqual(auditCandidates(result).byLocale,
  Object.fromEntries(LANGUAGES.map(l=>[l,1])));
 assert.equal(auditCandidates(result).malformed,0);
 assert.equal(auditCandidates(result).sourceGaps,0);
});
test('untranslated distractors are rejected rather than fabricated',()=>{
 const topic=FACT_TEMPLATES.find(t=>t.id==='capital');
 const source={wikidata:'https://www.wikidata.org/wiki/Q1#P36',
  wikipedia:'https://en.wikipedia.org/wiki/Example',wikipediaRevision:987};
 const s=entity('Q100','Country'),a=entity('Q200','Capital');
 const distractors=[entity('Q300','City A'),entity('Q400','City B'),entity('Q500','City C')];
 delete distractors[1].labels.ru;
 const rows=makeQuestions(topic,s,a,distractors,source,'capital:Q100:P36');
 assert.ok(rows.length<5);
 assert.ok(!rows.some(q=>q.locale==='ru'));
});
test('editor rejects repeated questions and incomplete Wikipedia provenance',()=>{
 const source={wikidata:'https://www.wikidata.org/wiki/Q1#P36',
  wikipedia:'https://en.wikipedia.org/wiki/Example',wikipediaRevision:10};
 const row={locale:'he',topic:'capital',question:'מהי בירת צרפת?',
  answers:['פריז','לונדון','רומא','ברלין'],correct_index:0,source};
 const report=auditCandidates([row,{...row}]);
 assert.equal(report.duplicates,1);
 assert.equal(report.malformed,0);
 assert.equal(auditCandidates([{...row,source:{...source,wikipediaRevision:null}}]).sourceGaps,1);
});
