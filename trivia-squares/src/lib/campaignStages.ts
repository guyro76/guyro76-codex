/** A sequential thirty-stage adventure. Worlds are visual chapters, stages are unique levels. */
export type StageTheme='orchard'|'crystal'|'clouds'|'galaxy';
export type CampaignStage={
 id:number;size:3|4|5|6;theme:StageTheme;nameHe:string;nameEn:string;icon:string;
 subtitleHe:string;subtitleEn:string;chapter:number;
};
export const CAMPAIGN_STAGES:readonly CampaignStage[]=[
  {
    "id": 1,
    "size": 3,
    "theme": "orchard",
    "nameHe": "שביל התפוחים",
    "nameEn": "Apple Trail",
    "icon": "🍏",
    "subtitleHe": "מסע ההיכרות מתחיל בנקודה הראשונה",
    "subtitleEn": "Your journey starts with the first dot",
    "chapter": 1
  },
  {
    "id": 2,
    "size": 3,
    "theme": "orchard",
    "nameHe": "חורשת הדובדבנים",
    "nameEn": "Cherry Grove",
    "icon": "🍒",
    "subtitleHe": "אוספים את פירות היער",
    "subtitleEn": "Gather the grove's hidden fruit",
    "chapter": 1
  },
  {
    "id": 3,
    "size": 3,
    "theme": "orchard",
    "nameHe": "גינת ההדרים",
    "nameEn": "Citrus Garden",
    "icon": "🍊",
    "subtitleHe": "צובעים את הדרך בזהב",
    "subtitleEn": "Paint the path in warm gold",
    "chapter": 1
  },
  {
    "id": 4,
    "size": 4,
    "theme": "orchard",
    "nameHe": "מבוך העלים",
    "nameEn": "Leaf Maze",
    "icon": "🍃",
    "subtitleHe": "הריבועים הראשונים מתרחבים",
    "subtitleEn": "The first larger board",
    "chapter": 1
  },
  {
    "id": 5,
    "size": 4,
    "theme": "orchard",
    "nameHe": "כתר הפרדס",
    "nameEn": "Orchard Crown",
    "icon": "🍎",
    "subtitleHe": "הכתר הראשון ממתין לך",
    "subtitleEn": "Your first chapter crown awaits",
    "chapter": 1
  },
  {
    "id": 6,
    "size": 3,
    "theme": "crystal",
    "nameHe": "מערת הברקת",
    "nameEn": "Emerald Cavern",
    "icon": "💚",
    "subtitleHe": "זוהר ירוק במעמקי המכרה",
    "subtitleEn": "Green light beneath the earth",
    "chapter": 2
  },
  {
    "id": 7,
    "size": 4,
    "theme": "crystal",
    "nameHe": "שביל הספיר",
    "nameEn": "Sapphire Path",
    "icon": "🔹",
    "subtitleHe": "חיבורים נוצצים על השבילים",
    "subtitleEn": "Sparkling connections",
    "chapter": 2
  },
  {
    "id": 8,
    "size": 4,
    "theme": "crystal",
    "nameHe": "תיבת האודם",
    "nameEn": "Ruby Vault",
    "icon": "❤️",
    "subtitleHe": "מחפשים אבני חן נדירות",
    "subtitleEn": "A rare gem is hidden",
    "chapter": 2
  },
  {
    "id": 9,
    "size": 5,
    "theme": "crystal",
    "nameHe": "מקדש האמטיסט",
    "nameEn": "Amethyst Temple",
    "icon": "💜",
    "subtitleHe": "לוח רחב עם אתגר סגירה",
    "subtitleEn": "A wider capture challenge",
    "chapter": 2
  },
  {
    "id": 10,
    "size": 5,
    "theme": "crystal",
    "nameHe": "לב המכרה",
    "nameEn": "Heart of the Mine",
    "icon": "💎",
    "subtitleHe": "פרס המכרה מחכה בסיום",
    "subtitleEn": "The mine's final treasure",
    "chapter": 2
  },
  {
    "id": 11,
    "size": 3,
    "theme": "clouds",
    "nameHe": "סולם העננים",
    "nameEn": "Cloud Ladder",
    "icon": "☁️",
    "subtitleHe": "קווים בין עננים רכים",
    "subtitleEn": "Step into the sky",
    "chapter": 3
  },
  {
    "id": 12,
    "size": 4,
    "theme": "clouds",
    "nameHe": "רוח הצפון",
    "nameEn": "Northern Breeze",
    "icon": "🌬️",
    "subtitleHe": "המסע גובר בתנועה",
    "subtitleEn": "Ride the northern winds",
    "chapter": 3
  },
  {
    "id": 13,
    "size": 5,
    "theme": "clouds",
    "nameHe": "ארמון הקשת",
    "nameEn": "Rainbow Palace",
    "icon": "🌈",
    "subtitleHe": "שמונה צבעים בעולם אחד",
    "subtitleEn": "A palace of bright colors",
    "chapter": 3
  },
  {
    "id": 14,
    "size": 5,
    "theme": "clouds",
    "nameHe": "איי השמיים",
    "nameEn": "Sky Islands",
    "icon": "🏝️",
    "subtitleHe": "מגלים איים מעל העננים",
    "subtitleEn": "Discover floating islands",
    "chapter": 3
  },
  {
    "id": 15,
    "size": 6,
    "theme": "clouds",
    "nameHe": "שער השחר",
    "nameEn": "Dawn Gate",
    "icon": "🌅",
    "subtitleHe": "אתגר גדול לפני הזריחה",
    "subtitleEn": "A grand board at sunrise",
    "chapter": 3
  },
  {
    "id": 16,
    "size": 3,
    "theme": "galaxy",
    "nameHe": "אבק כוכבים",
    "nameEn": "Stardust",
    "icon": "✨",
    "subtitleHe": "ניצוץ ראשון בגלקסיה",
    "subtitleEn": "Your first cosmic spark",
    "chapter": 4
  },
  {
    "id": 17,
    "size": 4,
    "theme": "galaxy",
    "nameHe": "טבעת שבתאי",
    "nameEn": "Saturn's Rings",
    "icon": "🪐",
    "subtitleHe": "סיבוב סביב כוכב הלכת",
    "subtitleEn": "Circle the ringed planet",
    "chapter": 4
  },
  {
    "id": 18,
    "size": 5,
    "theme": "galaxy",
    "nameHe": "שביל החלב",
    "nameEn": "Milky Way",
    "icon": "🌌",
    "subtitleHe": "מפת כוכבים מפתיעה",
    "subtitleEn": "A sky full of surprises",
    "chapter": 4
  },
  {
    "id": 19,
    "size": 5,
    "theme": "galaxy",
    "nameHe": "ערפילית הסודות",
    "nameEn": "Secret Nebula",
    "icon": "🔮",
    "subtitleHe": "כל ריבוע חושף רמז",
    "subtitleEn": "Each square reveals a clue",
    "chapter": 4
  },
  {
    "id": 20,
    "size": 6,
    "theme": "galaxy",
    "nameHe": "כתר הגלקסיה",
    "nameEn": "Galactic Crown",
    "icon": "👑",
    "subtitleHe": "מעבר בשער הכוכבים",
    "subtitleEn": "Pass the gate of stars",
    "chapter": 4
  },
  {
    "id": 21,
    "size": 4,
    "theme": "orchard",
    "nameHe": "הפרדס הקסום",
    "nameEn": "Enchanted Orchard",
    "icon": "🦋",
    "subtitleHe": "החזרה אל עולם הפירות",
    "subtitleEn": "The orchard transforms",
    "chapter": 5
  },
  {
    "id": 22,
    "size": 5,
    "theme": "crystal",
    "nameHe": "ארמון הקריסטל",
    "nameEn": "Crystal Palace",
    "icon": "🏰",
    "subtitleHe": "רצף של ריבועים נוצצים",
    "subtitleEn": "A shining puzzle palace",
    "chapter": 5
  },
  {
    "id": 23,
    "size": 5,
    "theme": "clouds",
    "nameHe": "מעל הקשת",
    "nameEn": "Beyond the Rainbow",
    "icon": "🌤️",
    "subtitleHe": "מפת עננים מורכבת",
    "subtitleEn": "A complex sky map",
    "chapter": 5
  },
  {
    "id": 24,
    "size": 6,
    "theme": "galaxy",
    "nameHe": "המטאור הכחול",
    "nameEn": "Blue Meteor",
    "icon": "☄️",
    "subtitleHe": "מוצאים את הדרך במטר כוכבים",
    "subtitleEn": "Navigate the meteor shower",
    "chapter": 5
  },
  {
    "id": 25,
    "size": 6,
    "theme": "orchard",
    "nameHe": "יער האגדות",
    "nameEn": "Forest of Legends",
    "icon": "🌳",
    "subtitleHe": "היער הגדול מצפה לאלוף",
    "subtitleEn": "The forest awaits a champion",
    "chapter": 5
  },
  {
    "id": 26,
    "size": 5,
    "theme": "crystal",
    "nameHe": "יהלום הירח",
    "nameEn": "Moon Diamond",
    "icon": "🌙",
    "subtitleHe": "אבני חן תחת אור ירח",
    "subtitleEn": "Gems under moonlight",
    "chapter": 6
  },
  {
    "id": 27,
    "size": 6,
    "theme": "clouds",
    "nameHe": "ענן הדרקון",
    "nameEn": "Dragon Cloud",
    "icon": "🐉",
    "subtitleHe": "עננים קסומים וכיבושים",
    "subtitleEn": "A mythical sky challenge",
    "chapter": 6
  },
  {
    "id": 28,
    "size": 6,
    "theme": "galaxy",
    "nameHe": "מסע בין כוכבים",
    "nameEn": "Interstellar Voyage",
    "icon": "🚀",
    "subtitleHe": "מתקדמים אל הלא נודע",
    "subtitleEn": "Go beyond the known skies",
    "chapter": 6
  },
  {
    "id": 29,
    "size": 6,
    "theme": "galaxy",
    "nameHe": "שער האינסוף",
    "nameEn": "Infinity Gate",
    "icon": "♾️",
    "subtitleHe": "האתגר שלפני הגמר הגדול",
    "subtitleEn": "The final gate",
    "chapter": 6
  },
  {
    "id": 30,
    "size": 6,
    "theme": "galaxy",
    "nameHe": "אלוף שלושים השלבים",
    "nameEn": "Master of Thirty",
    "icon": "🏆",
    "subtitleHe": "הגמר הגדול — כיבוש הלוח האחרון",
    "subtitleEn": "The grand finale of the adventure",
    "chapter": 6
  }
];
export const STAGE_COUNT=CAMPAIGN_STAGES.length;
export function stageFor(value:number):CampaignStage{
 const stage=CAMPAIGN_STAGES.find(s=>s.id===value);
 if(!stage)throw Error('Unknown campaign stage');
 return stage;
}
export function canOpenStage(id:number,completedStage:number,activeStage:number,activeFinished:boolean){
 return Number.isInteger(id)&&id>=1&&id<=STAGE_COUNT&&id<=completedStage+1
  &&(id===activeStage||activeFinished);
}
export function nextUnlockedStage(current:number,completedStage:number){
 return current<STAGE_COUNT&&current<=completedStage?current+1:null;
}
