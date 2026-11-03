import {CAMPAIGN_STAGES,STAGE_COUNT} from './campaignStages';

export type StageCardKind = 'portrait'|'song'|'letter'|'stage';
export type StageCard = {
  id: string;
  title: string;
  subtitle: string;
  kind: StageCardKind;
  world: number;
  glyph: string;
  artistCredit: string;
  rarity: 'נדיר'|'אגדי'|'מיוחד';
  clue: string;
};
const entries: Record<number, {portrait: [string,string,string];song:[string,string,string];letter:[string,string,string]}> = {
  3: {
    portrait: ['לאונרדו דה וינצ׳י','ממציא ואמן מתקופת הרנסאנס','✦'],
    song: ['שיר הגן','קלף מוזיקה מקורי · יצירת המשחק','♫'],
    letter: ['אות האוצר: ת׳','אות למשחק הניחושים שבין השלבים','ת'],
  },
  4: {
    portrait: ['מארי קירי','חלוצת המחקר ברדיואקטיביות','✦'],
    song: ['מנגינת הגביש','קלף מוזיקה מקורי · יצירת המשחק','♫'],
    letter: ['אות האוצר: י׳','אות למשחק הניחושים שבין השלבים','י'],
  },
  5: {
    portrait: ['אמיליה ארהארט','חלוצת התעופה','✦'],
    song: ['שיר העננים','קלף מוזיקה מקורי · יצירת המשחק','♫'],
    letter: ['אות האוצר: ע׳','אות למשחק הניחושים שבין השלבים','ע'],
  },
  6: {
    portrait: ['גלילאו גליליי','אסטרונום וחוקר טבע','✦'],
    song: ['תזמורת הכוכבים','קלף מוזיקה מקורי · יצירת המשחק','♫'],
    letter: ['אות האוצר: ג׳','אות למשחק הניחושים שבין השלבים','ג'],
  },
};
export const stageWords: Record<number,{answer:string;hint:string}> = {
  3:{answer:'תפוח',hint:'פרי שגדל על עץ בגן'},
  4:{answer:'יהלום',hint:'אבן יקרה נוצצת במיוחד'},
  5:{answer:'עננים',hint:'שטים בשמיים ולעיתים מורידים גשם'},
  6:{answer:'גלקסיה',hint:'מערכת עצומה של כוכבים'},
};
export const stageCards: StageCard[] = ([3,4,5,6] as const).flatMap(world=>
  (['portrait','song','letter'] as const).map(kind=>{
    const [title,subtitle,glyph]=entries[world][kind];
    return {
      id:`world-${world}-${kind}`,title,subtitle,kind,world,glyph,
      artistCredit:'איור מקורי שנוצר עבור טריוויה ריבועים',
      rarity:kind==='portrait'?'אגדי':kind==='letter'?'מיוחד':'נדיר',
      clue:kind==='letter'?'אפשר להיעזר באות כשרוצים לנחש את מילת השלב.':'קלף חדש לאוסף היצירות שלך.'
    } satisfies StageCard;
  })
);
/** Every one of the 200 stages has its own collectible card, so a card never repeats.
 *  (The 12 legacy cards above stay valid for albums saved before 2026-11-03.) */
export function stageCollectible(stage:number):StageCard{
  const s=CAMPAIGN_STAGES.find(x=>x.id===stage)||CAMPAIGN_STAGES[0];
  return {id:'stage-'+s.id,title:s.nameHe,subtitle:s.subtitleHe,kind:'stage',world:s.size,glyph:'',
    artistCredit:'איור מקורי שנוצר עבור טריוויה ריבועים',
    rarity:s.id%10===0?'אגדי':s.id%5===0?'נדיר':'מיוחד',clue:'קלף חדש לאוסף היצירות שלך.'};
}
export const STAGE_CARD_TOTAL=STAGE_COUNT;
export function cardById(id: string): StageCard | undefined {
  const m=/^stage-(\d{1,3})$/.exec(id);
  if(m){const n=Number(m[1]);return n>=1&&n<=STAGE_COUNT?stageCollectible(n):undefined;}
  return stageCards.find(c=>c.id===id);
}
export function localStageCard(world:number,runId:string):StageCard {
  const salt=[...runId].reduce((acc,ch)=>((acc*31+ch.charCodeAt(0))>>>0),0);
  const index=salt%3;
  return stageCards.filter(c=>c.world===world)[index] || stageCards[0];
}
export const localAlbumKey = 'trivia-local-collectible-album-v1';
export type LocalEarned = {matchId:string;cardId:string;played:boolean;game?:'wheel'|'word'|'balloons'|'cake'|'quiz'|'scratch'|'sword'|'scissors'|'tictactoe'|'sequence'|'pairs';prize?:string;clearRewarded?:boolean;earnedAt:string};
export function readLocalAlbum():LocalEarned[]{
  try{
    const list=JSON.parse(localStorage.getItem(localAlbumKey)||'[]');
    return Array.isArray(list)?list.filter((row):row is LocalEarned=>Boolean(
      row&&typeof row.matchId==='string'&&typeof row.cardId==='string'&&cardById(row.cardId)
    )).slice(-150):[];
  }catch{return [];}
}
export function saveLocalAlbum(rows:LocalEarned[]):void{
  try{localStorage.setItem(localAlbumKey,JSON.stringify(rows.slice(-150)))}catch{}
}
