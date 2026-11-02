import {topicForQuestion,type QuestionTopic} from './questionTopics.ts';

export type QuestionForMix={category:string;text:string};
const GEOGRAPHY='capitals';
/** Owner rule (2026-11-02): one geography question, then a long run of other categories. */
export const GEOGRAPHY_GAP=7;
/** No topic may come back within this many questions when other topics are available. */
export const TOPIC_REPEAT_GAP=3;
export const RECENT_TOPIC_MEMORY=8;
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
 const recent=recentTopics.slice(-RECENT_TOPIC_MEMORY);
 const last=recent[recent.length-1];
 // When other topics are available, enforce a maximum of one geography question
 // in any four-question window. If the bank only contains geography, keep
 // playing rather than giving a free stroke or deleting saved history.
 if(nonGeography.length&&recent.slice(-GEOGRAPHY_GAP).includes(GEOGRAPHY))
   topics=topics.filter(t=>t!==GEOGRAPHY);
 const fresh=topics.filter(t=>!recent.slice(-TOPIC_REPEAT_GAP).includes(t));
 if(fresh.length)topics=fresh;
 else if(topics.length>1&&last)topics=topics.filter(t=>t!==last);
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
  'sports','science','nature','history','food','arts','languages','israel_geography','bible','general'
 ]);
 return Array.isArray(raw)?raw.filter((v):v is QuestionTopic=>allowed.has(v as QuestionTopic)).slice(-RECENT_TOPIC_MEMORY):[];
}

export function isGeographyQuestion(q:QuestionForMix):boolean{
 return topicForQuestion(q.category,q.text)===GEOGRAPHY;
}
