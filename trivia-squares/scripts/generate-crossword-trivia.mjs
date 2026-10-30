#!/usr/bin/env node
/**
 * Wikipedia + Wikidata evidence-first trivia candidate generator.
 *
 * IMPORTANT: every output is unapproved, and can only enter the game through
 * the existing editorial review process. No service-role keys are used.
 * Nothing writes to Supabase or creates paid cloud jobs.
 *
 * Usage: node scripts/generate-crossword-trivia.mjs --topics film-director,book-author --limit 25 --out ./review.json
 */
import {writeFile} from 'node:fs/promises';
import {FACT_TEMPLATES,CATEGORIES,LANGUAGES,phraseFor} from './crossword-topics.mjs';

const AGENT='TriviaSquaresCrosswordQA/1.0 (public non-commercial trivia research; https://github.com/guyro76/guyro76-codex/issues)';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const safeId=(id,prefix)=>typeof id==='string'&&new RegExp('^'+prefix+'[1-9][0-9]*$').test(id);
const normalize=s=>String(s||'').normalize('NFKC').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const hash=s=>{let n=2166136261;for(const c of s){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;};
const entityId=uri=>/^https?:\/\/www\.wikidata\.org\/entity\/(Q[1-9][0-9]*)$/.exec(uri)?.[1]||null;

export function verifySingleStatement(entity,property,targetId){
 const statements=entity?.claims?.[property];
 if(!Array.isArray(statements))return false;
 const ids=[...new Set(statements.filter(s=>s.rank!=='deprecated'&&s.mainsnak?.snaktype==='value')
  .map(s=>s.mainsnak?.datavalue?.value?.id).filter(id=>safeId(id,'Q')))];
 return ids.length===1&&ids[0]===targetId;
}
export function hasAllTranslations(subject,answer){
 return [subject,answer].every(ent=>LANGUAGES.every(l=>{
  const v=ent?.labels?.[l]?.value;
  return typeof v==='string'&&v.length>=2&&!/^Q\d+$/i.test(v);
 }));
}
export function introSupportsAnswer(extract,label,aliases=[]){
 const normalized=normalize(extract);
 return [label,...aliases].some(v=>{
  const name=normalize(v);
  return name.length>=3&&(' '+normalized+' ').includes(' '+name+' ');
 });
}
export function makeUniqueAnswers(answerId,otherIds,seed){
 const distinct=[...new Set(otherIds)].filter(v=>v!==answerId&&safeId(v,'Q')).sort();
 if(distinct.length<3)return null;
 const start=hash(seed)%distinct.length;
 const chosen=[answerId,...[0,1,2].map(i=>distinct[(start+i)%distinct.length])];
 // Rotate correct answer across all four positions deterministically.
 const answerIndex=hash('answer-position:'+seed)%4;
 const answer=chosen.shift();
 chosen.splice(answerIndex,0,answer);
 return {ids:chosen,correct_index:answerIndex};
}
export function makeQuestions(topic,subject,answer,distractors,source,seed){
 const cat=CATEGORIES.find(c=>c.id===topic.category);
 const arrangement=makeUniqueAnswers(answer.id,distractors.map(e=>e.id),seed);
 if(!cat||!arrangement||!hasAllTranslations(subject,answer))return [];
 return LANGUAGES.map(locale=>{
  const answers=arrangement.ids.map(id=>
    (id===answer.id?answer:distractors.find(e=>e.id===id))?.labels?.[locale]?.value);
  if(answers.some(v=>!v||/^Q\d+$/.test(v)))return null;
  if(new Set(answers.map(normalize)).size!==4)return null;
  const text=phraseFor(topic.phrase,locale,subject.labels[locale].value);
  return {locale,category:cat[locale],topic:topic.id,difficulty:topic.difficulty,
   question:text,answers,correct_index:arrangement.correct_index,
   premium:topic.difficulty>=3&&hash(seed)%11===0,
   factKey:subject.id+':'+topic.property,source,
   editorialStatus:'pending_review',factCheckedAt:new Date().toISOString()};
 }).filter(Boolean);
}
function wikidataQuery(topic,limit,offset){
 for(const id of [topic.classId,topic.extraItem].filter(Boolean))
  if(!safeId(id,'Q'))throw new Error('Invalid class or source item');
 for(const p of [topic.property,topic.extraProperty].filter(Boolean))
  if(!safeId(p,'P'))throw new Error('Invalid property');
 let body='?subject wdt:P31 wd:'+topic.classId+' . ?subject wdt:'+topic.property+' ?answer . ';
 if(topic.extraProperty)body+='?subject wdt:'+topic.extraProperty+' wd:'+topic.extraItem+' . ';
 body+='FILTER(STRSTARTS(STR(?answer), "http://www.wikidata.org/entity/Q")) ';
 // Restrict to subjects with Wikipedia sitelinks; no expensive text REGEX.
 return 'SELECT DISTINCT ?subject ?answer WHERE { '+body+' } LIMIT '+limit+' OFFSET '+offset;
}
async function getJson(url,accept='application/json'){
 const res=await fetch(url,{headers:{'User-Agent':AGENT,'Accept':accept},signal:AbortSignal.timeout(22000)});
 if(!res.ok)throw new Error('Source request failed HTTP '+res.status+' '+new URL(url).hostname);
 return res.json();
}
async function searchWikidata(topic,limit=70,offset=0){
 const query=wikidataQuery(topic,Math.min(limit,100),offset);
 const u='https://query.wikidata.org/sparql?'+new URLSearchParams({query,format:'json'});
 const data=await getJson(u,'application/sparql-results+json');
 return (data.results?.bindings||[]).map(row=>({
  subjectId:entityId(row.subject?.value),answerId:entityId(row.answer?.value)
 })).filter(x=>x.subjectId&&x.answerId);
}
async function getEntities(ids){
 const result={};
 for(let i=0;i<ids.length;i+=20){
  const chunk=ids.slice(i,i+20);
  const u='https://www.wikidata.org/w/api.php?'+new URLSearchParams({
   action:'wbgetentities',ids:chunk.join('|'),props:'labels|aliases|claims|sitelinks',
   languages:LANGUAGES.join('|'),languagefallback:'0',format:'json'
  });
  const data=await getJson(u);
  Object.assign(result,data.entities||{});
  if(i+20<ids.length)await sleep(900);
 }
 return result;
}
async function wikipediaIntro(subject){
 const title=subject?.sitelinks?.enwiki?.title;
 if(typeof title!=='string'||!title)return null;
 const u='https://en.wikipedia.org/w/api.php?'+new URLSearchParams({
  action:'query',prop:'extracts|pageprops|revisions',exintro:'1',explaintext:'1',
  rvprop:'ids',rvlimit:'1',redirects:'1',titles:title,format:'json'
 });
 const data=await getJson(u);
 const page=Object.values(data.query?.pages||{})[0];
 if(!page||page.missing!==undefined||page.pageprops?.wikibase_item!==subject.id)return null;
 return {extract:page.extract||'',revision:page.revisions?.[0]?.revid||null,
  url:'https://en.wikipedia.org/wiki/'+encodeURIComponent(title.replaceAll(' ','_'))};
}
function answerAliases(entity){
 return (entity.aliases?.en||[]).map(x=>x.value).filter(v=>typeof v==='string').slice(0,8);
}
function roundRobin(groups,limit){
 const result=[];
 while(result.length<limit&&groups.some(g=>g.length)){
  for(const group of groups){if(group.length&&result.length<limit)result.push(group.shift());}
 }
 return result;
}
export function auditCandidates(rows){
 const status={total:rows.length,byCategory:{},byLocale:{},duplicates:0,malformed:0,sourceGaps:0};
 const seen=new Set();
 for(const row of rows){
  status.byCategory[row.topic]=(status.byCategory[row.topic]||0)+1;
  status.byLocale[row.locale]=(status.byLocale[row.locale]||0)+1;
  const key=row.locale+'|'+normalize(row.question);
  if(seen.has(key))status.duplicates++;seen.add(key);
  if(!Array.isArray(row.answers)||row.answers.length!==4||
     new Set(row.answers.map(normalize)).size!==4||row.correct_index<0||row.correct_index>3)
     status.malformed++;
  if(!row.source?.wikidata||!row.source?.wikipedia||!row.source?.wikipediaRevision)
     status.sourceGaps++;
 }
 return status;
}
export async function generate({topicIds,limit=20,offset=0,log=()=>{}}){
 const selected=FACT_TEMPLATES.filter(t=>!topicIds.length||topicIds.includes(t.id));
 if(!selected.length)throw new Error('No configured Wikidata fact templates selected');
 const groups=[];
 const proofStats={scanned:0,noUniqueClaim:0,missingTranslations:0,
  noWikipediaArticle:0,noWikipediaIntroEvidence:0,acceptedFacts:0};
 for(const topic of selected){
  log('Searching '+topic.id);
  const bindings=await searchWikidata(topic,Math.min(100,Math.max(50,limit*3)),offset);
  const ids=[...new Set(bindings.flatMap(x=>[x.subjectId,x.answerId]))];
  const data=await getEntities(ids);
  const verified=[];
  for(const fact of bindings){
   proofStats.scanned++;
   const subject=data[fact.subjectId],answer=data[fact.answerId];
   if(!verifySingleStatement(subject,topic.property,fact.answerId)){
    proofStats.noUniqueClaim++;continue;
   }
   if(!hasAllTranslations(subject,answer)){
    proofStats.missingTranslations++;continue;
   }
   const intro=await wikipediaIntro(subject);
   await sleep(850);
   if(!intro){proofStats.noWikipediaArticle++;continue;}
   if(!introSupportsAnswer(intro.extract,answer.labels.en.value,answerAliases(answer))){
    proofStats.noWikipediaIntroEvidence++;continue;
   }
   verified.push({subject,answer,source:{
    wikidata:'https://www.wikidata.org/wiki/'+subject.id+'#'+topic.property,
    wikipedia:intro.url,wikipediaRevision:intro.revision,
    wikidataClaim:topic.property,subjectId:subject.id,answerId:answer.id,
    verification:'Wikidata single current claim + English Wikipedia intro name match'
   }});
   proofStats.acceptedFacts++;
   if(verified.length>=limit*2)break;
  }
  const allAnswers=[...new Map(verified.map(v=>[v.answer.id,v.answer])).values()];
  const questionPacks=[];
  for(const item of verified){
   const distractors=allAnswers.filter(a=>a.id!==item.answer.id);
   if(distractors.length<3)continue;
   const seed=topic.id+':'+item.subject.id+':'+topic.property;
   // Keep each fact atomic: either all five complete locale translations or none.
   const pack=makeQuestions(topic,item.subject,item.answer,distractors,item.source,seed);
   if(pack.length===LANGUAGES.length)questionPacks.push(pack);
   if(questionPacks.length>=limit)break;
  }
  groups.push(questionPacks);
  log('Verified '+verified.length+' source facts; '+questionPacks.length+' five-locale question packs');
  await sleep(1100);
 }
 const all=roundRobin(groups,limit).flat();
 const report=auditCandidates(all);
 if(report.duplicates||report.malformed||report.sourceGaps)
  throw new Error('Editorial quality gate failed: '+JSON.stringify(report));
 return {format:'trivia-squares-editorial-candidates',version:1,
  createdAt:new Date().toISOString(),approved:false,
  licensing:'Wikidata CC0. Wikipedia links are verification evidence; no Wikipedia prose is copied.',
  workflow:'Independent editorial review is required before Supabase publication.',
  topicCount:selected.length,proofStats,quality:report,questions:all};
}
function parseArgs(args){
 const opts={topicIds:[],limit:20,offset:0,out:null,help:false};
 for(let i=0;i<args.length;i++){
  const a=args[i],v=args[i+1];
  if(a==='--topics'){opts.topicIds=v.split(',').map(x=>x.trim());i++;}
  else if(a==='--limit'){opts.limit=Number(v);i++;}
  else if(a==='--offset'){opts.offset=Number(v);i++;}
  else if(a==='--out'){opts.out=v;i++;}
  else if(a==='--help')opts.help=true;
  else throw new Error('Unknown option '+a);
 }
 if(!Number.isInteger(opts.limit)||opts.limit<1||opts.limit>100||
   !Number.isInteger(opts.offset)||opts.offset<0||opts.offset>100000)
  throw new Error('Invalid pagination');
 if(opts.topicIds.some(id=>!FACT_TEMPLATES.some(t=>t.id===id)))
  throw new Error('Unknown topic template');
 return opts;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 try{
  const opts=parseArgs(process.argv.slice(2));
  if(opts.help){console.log('node scripts/generate-crossword-trivia.mjs --topics film-director,novel-author --limit 20 --out ./review.json');}
  else{
   const result=await generate({...opts,log:s=>console.error(s)});
   const output=JSON.stringify(result,null,2)+'\n';
   if(opts.out){await writeFile(opts.out,output,'utf8');console.log('Editorial candidates written to '+opts.out);}
   else process.stdout.write(output);
   console.error('Source check: '+JSON.stringify(result.proofStats)+'; QA: '+JSON.stringify(result.quality));
  }
 }catch(e){console.error('TRIVIA GENERATOR FAILED:',e.message);process.exitCode=1;}
}
