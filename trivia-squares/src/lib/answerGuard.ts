/** Owner rule (2026-11-03): a question must never contain its own answer.
 *  Last line of defence for every question shown in local play, including server batches
 *  that arrive without the answer index: if ANY of the four options appears word-for-word
 *  in the question, the question is not dealt at all. Results are cached per question object. */
const norm=(s:string)=>' '+String(s).toLocaleLowerCase().normalize('NFKC')
  .replace(/[֑-ׇ]/g,'')
  .replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim()+' ';

export function answerInQuestion(text:string,answers:readonly string[]):boolean{
  const t=norm(text);
  return answers.some(a=>{
    const n=norm(a).trim();
    if(n.length<3||/^[\d ]+$/.test(n))return false;
    return t.includes(' '+n+' ');
  });
}

const seen=new WeakMap<object,boolean>();
export function withoutAnswerLeaks<T extends {text:string;answers:readonly string[]}>(bank:readonly T[]):T[]{
  return bank.filter(q=>{
    let leak=seen.get(q);
    if(leak===undefined){leak=answerInQuestion(q.text,q.answers);seen.set(q,leak);}
    return !leak;
  });
}
