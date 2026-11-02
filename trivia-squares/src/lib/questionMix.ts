import {topicForQuestion,type QuestionTopic} from './questionTopics.ts';

export type QuestionForMix={category:string;text:string};
const GEOGRAPHY='capitals';
const LOCATION_PATTERN=/\b(?:which city|where (?:is|are)|in which city|dans quelle ville|in welcher stadt|в каком городе|en qu[eé] ciudad|¿d[oó]nde|quelle ville)\b|באיזו עיר|באיזה עיר|באיזו מדינה|איפה נמצאת|היכן נמצאת|באיזה מקום|в каком городе|в какой стране|dans quel pays|dans quelle ville|¿en qué ciudad|¿en qué país|في أي مدينة|في أي دولة|أين تقع/iu;

/** Topics rotate across questions, not across SQL categories. A massive city bank
 * must not dominate the quiz merely because it has thousands of question rows.
 * Does not alter scores, question IDs or the saved board. */
export function selectVariedQuestion<T extends QuestionForMix>(
 questions:readonly T[],recentTopics:readonly QuestionTopic[],random:()=>number=Math.random
):{question:T;topic:QuestionTopic}|null{
 if(!questions.length)return null;
 const buckets=new Map<QuestionTopic,T[]>();
 for(const q of questions){
  const topic=topicForQuestion(q.category,q.text);
  const bucket=buckets.get(topic)||[];
  bucket.push(q);buckets.set(topic,bucket);
 }
 let topics=[...buckets.keys()];
 const nonGeography=topics.filter(t=>t!==GEOGRAPHY);
 const recent=recentTopics.slice(-8);
 const last=recent[recent.length-1];
 // When other topics are available, enforce a maximum of one geography question
 // in any four-question window. If the bank only contains geography, keep
 // playing rather than giving a free stroke or deleting saved history.
 if(nonGeography.length&&recent.slice(-3).includes(GEOGRAPHY))
   topics=topics.filter(t=>t!==GEOGRAPHY);
 if(topics.length>1&&last)topics=topics.filter(t=>t!==last);
 if(!topics.length)topics=[...buckets.keys()];
 const minExposure=Math.min(...topics.map(t=>recent.filter(x=>x===t).length));
 topics=topics.filter(t=>recent.filter(x=>x===t).length===minExposure);
 // For ties, choose a different topic at random, not a random row from the
 // 5,000 geography records. This guarantees category variety when available.
 const topic=topics[Math.min(topics.length-1,Math.floor(random()*topics.length))];
 const options=buckets.get(topic)!;
 const nonLocation=options.filter(q=>!LOCATION_PATTERN.test(q.text));
 const within=topic===GEOGRAPHY&&nonLocation.length?nonLocation:options;
 const question=within[Math.min(within.length-1,Math.floor(random()*within.length))];
 return {question,topic};
}

export function readRecentQuestionTopics(raw:unknown):QuestionTopic[]{
 const allowed=new Set<QuestionTopic>([
  'tv_film','disney','music','eurovision','israel_politics','capitals','aviation','cars',
  'sports','science','nature','history','food','arts','languages','general'
 ]);
 return Array.isArray(raw)?raw.filter((v):v is QuestionTopic=>allowed.has(v as QuestionTopic)).slice(-8):[];
}

export function isGeographyQuestion(q:QuestionForMix):boolean{
 return topicForQuestion(q.category,q.text)===GEOGRAPHY;
}

/** When every unseen question left is geography (the server bank is ~95% generated
 *  "which country/city" rows), the topic rotation has nothing to rotate to and the
 *  player gets city after city. In that case bring back varied questions the player
 *  saw longest ago, so selectVariedQuestion can keep geography to one in four.
 *  The most recent `protectRecent` questions are never recycled. Pure: no storage. */
export function withRecycledVariety<T extends QuestionForMix>(
 unseen:readonly T[],bank:readonly T[],seenOrder:readonly string[],
 canonical:(text:string)=>string,protectRecent=60,limit=80
):T[]{
 if(!unseen.length||unseen.some(q=>!isGeographyQuestion(q)))return [...unseen];
 const recent=new Set(seenOrder.slice(-protectRecent));
 const rank=new Map(seenOrder.map((text,index)=>[text,index]));
 const unseenTexts=new Set(unseen.map(q=>canonical(q.text)));
 const picked=new Map<string,T>();
 for(const q of bank){
  const key=canonical(q.text);
  if(isGeographyQuestion(q)||recent.has(key)||unseenTexts.has(key)||picked.has(key))continue;
  picked.set(key,q);
 }
 const recycled=[...picked.values()]
  .sort((a,b)=>(rank.get(canonical(a.text))??-1)-(rank.get(canonical(b.text))??-1))
  .slice(0,limit);
 return [...unseen,...recycled];
}
