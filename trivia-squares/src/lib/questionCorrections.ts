/** Corrections to questions that ship inside the app (bundled banks).
 *  The hourly review engine writes them on the server after an approved appeal or report;
 *  the app downloads them and applies them both to what is shown and to how answers are scored,
 *  so a corrected question is displayed and checked the same way. */
export type CorrectionRow={question_id:number;locale:string;action:'fix'|'retire';
  new_value:{question?:string;answers?:string[];correct_index?:number}|null};
type Fix={text:string;answers:string[];correct:number};

const STORAGE_KEY='trivia-question-corrections-v1';
const fixes=new Map<number,Fix>();
const retired=new Set<number>();

function validFix(v:CorrectionRow['new_value']):Fix|null{
  if(!v||typeof v.question!=='string'||!Array.isArray(v.answers)||v.answers.length<2||v.answers.length>6)return null;
  if(!v.answers.every(a=>typeof a==='string'&&a.length>0))return null;
  if(!Number.isInteger(v.correct_index)||(v.correct_index as number)<0||(v.correct_index as number)>=v.answers.length)return null;
  return {text:v.question,answers:[...v.answers],correct:v.correct_index as number};
}

export function setQuestionCorrections(rows:readonly CorrectionRow[],persist=true){
  fixes.clear();retired.clear();
  for(const row of rows){
    const id=Number(row?.question_id);
    if(!Number.isSafeInteger(id)||id<=0)continue;
    if(row.action==='retire'){retired.add(id);fixes.delete(id);continue}
    const fix=validFix(row.new_value);
    if(fix){fixes.set(id,fix);retired.delete(id)}
  }
  if(persist){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(rows))}catch{}}
}

export function loadCachedQuestionCorrections(){
  try{const rows=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');if(Array.isArray(rows))setQuestionCorrections(rows,false)}catch{}
}

export function correctionFor(id:number|undefined):Fix|undefined{return typeof id==='number'?fixes.get(id):undefined}

export function isRetiredQuestion(id:number|undefined){return typeof id==='number'&&retired.has(id)}

/** Returns the corrected version of a bundled question (same object shape), or the original. */
export function correctedQuestion<T extends {id:number;text:string;answers:readonly string[];correct:number}>(q:T):T{
  const fix=fixes.get(q.id);
  return fix?{...q,text:fix.text,answers:fix.answers,correct:fix.correct}:q;
}

export function applyQuestionCorrections<T extends {id:number;text:string;answers:readonly string[];correct:number}>(bank:readonly T[]):T[]{
  if(!fixes.size&&!retired.size)return bank as T[];
  return bank.filter(q=>!retired.has(q.id)).map(correctedQuestion);
}
