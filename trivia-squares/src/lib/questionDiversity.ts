/** Within-stage question diversity. Pure selector shared by all six client locales.
 * A large geography bank must never crowd out available culture/science/sport questions.
 * Does not mark questions as viewed, mutate progression or reset the player's history.
 */
import {topicForQuestion,type QuestionTopic} from './questionTopics.ts';

export type BalancedQuestion={id:number;category:string;text:string};
export type TopicHistoryEntry={topic:QuestionTopic;category:string;pattern:string};

export function questionPattern(category:string,text:string):string{
 const topic=topicForQuestion(category,text);
 const normalized=text.normalize('NFKC').toLocaleLowerCase().trim();
 if(topic==='capitals'&&/עיר|מדינה|ממוקמת|נמצאת|באיזו|איפה|which city|what city|located|where is|город|где находится|ville|ciudad|dónde|أين|مدينة|يقع/.test(normalized))
   return 'city-location';
 const tokens=normalized.replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/u);
 return topic+':'+tokens.slice(0,3).join(' ');
}
export function historyEntry(q:BalancedQuestion):TopicHistoryEntry{
 return {topic:topicForQuestion(q.category,q.text),category:q.category,pattern:questionPattern(q.category,q.text)};
}
export function selectBalancedQuestion<T extends BalancedQuestion>(
 pool:readonly T[],history:readonly TopicHistoryEntry[],selectedTopics:readonly QuestionTopic[],
 random:()=>number=Math.random
):T|undefined{
 if(!pool.length)return undefined;
 const preferred=pool.filter(q=>selectedTopics.includes(topicForQuestion(q.category,q.text)));
 const candidates=preferred.length?preferred:pool;
 const stage=history.slice(-50);
 const recent=stage.slice(-5);
 const topicCount=new Map<string,number>(),categoryCount=new Map<string,number>(),patternCount=new Map<string,number>();
 for(const h of stage){
   topicCount.set(h.topic,(topicCount.get(h.topic)||0)+1);
   categoryCount.set(h.category,(categoryCount.get(h.category)||0)+1);
   patternCount.set(h.pattern,(patternCount.get(h.pattern)||0)+1);
 }
 let best=Number.POSITIVE_INFINITY;
 const shortlist:T[]=[];
 for(const q of candidates){
   const topic=topicForQuestion(q.category,q.text),pattern=questionPattern(q.category,q.text);
   // Every additional question from a used topic is substantially less likely
   // than a fresh topic in this level. Geography/city-location has an explicit
   // penalty because it dominates the remote bank by volume.
   const score=(topicCount.get(topic)||0)*12+
     (categoryCount.get(q.category)||0)*2+
     (patternCount.get(pattern)||0)*8+
     (topic==='capitals'?4:0)+
     (pattern==='city-location'?7:0)+
     (recent.at(-1)?.topic===topic?12:0)+
     (recent.at(-2)?.topic===topic?5:0);
   if(score<best){best=score;shortlist.length=0;shortlist.push(q);}
   else if(score===best)shortlist.push(q);
 }
 return shortlist[Math.min(shortlist.length-1,Math.floor(Math.max(0,Math.min(.999999,random()))*shortlist.length))];
}
