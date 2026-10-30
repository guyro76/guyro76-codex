import type {QuestionTopic} from './questionTopics';

/** Choose unseen questions fairly inside each campaign stage, regardless of UI language.
 * With multiple topics available, never repeat the preceding topic and keep
 * geography below 25% of the stage's questions. A single-topic selection still works.
 */
export function chooseStageQuestion<T extends {category:string}>(
 candidates:readonly T[],
 history:readonly QuestionTopic[],
 classify:(question:T)=>QuestionTopic,
 lastCategory:string|null=null,
 random:()=>number=Math.random
):T|null{
 if(!candidates.length)return null;
 const groups=new Map<QuestionTopic,T[]>();
 for(const q of candidates){
  const topic=classify(q);
  const questions=groups.get(topic)||[];
  questions.push(q);groups.set(topic,questions);
 }
 const available=[...groups.keys()];
 const last=history.at(-1);
 const alternative=available.some(topic=>topic!==last);
 const eligible=alternative?available.filter(topic=>topic!==last):available;
 const otherThanGeography=eligible.some(topic=>topic!=='capitals');
 const countGeo=history.filter(topic=>topic==='capitals').length;
 const geoCap=Math.max(1,Math.ceil((history.length+1)/4));
 const geoControlled=otherThanGeography&&countGeo>=geoCap
   ?eligible.filter(topic=>topic!=='capitals'):eligible;
 const pool=geoControlled.length?geoControlled:eligible;
 const counts=new Map<QuestionTopic,number>();
 for(const topic of history)counts.set(topic,(counts.get(topic)||0)+1);
 const minCount=Math.min(...pool.map(topic=>counts.get(topic)||0));
 const leastPlayed=pool.filter(topic=>(counts.get(topic)||0)===minCount);
 const randomIndex=(max:number)=>Math.max(0,Math.min(max-1,Math.floor(random()*max)));
 const selected=leastPlayed[randomIndex(leastPlayed.length)];
 const candidatesInTopic=groups.get(selected)!;
 const differentCategory=candidatesInTopic.filter(q=>q.category!==lastCategory);
 const choices=differentCategory.length?differentCategory:candidatesInTopic;
 return choices[randomIndex(choices.length)];
}

/** Scoped key prevents refreshing the page from resetting stage variety. */
export function topicHistoryKey(stage:number):string{
 return 'trivia-stage-subject-history-v1-'+stage;
}
