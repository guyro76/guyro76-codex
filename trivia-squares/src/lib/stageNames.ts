import {CAMPAIGN_STAGES} from './campaignStages';
import {SPANISH_STAGE_NAMES} from './spanishStageNames';
import {RUSSIAN_STAGE_NAMES} from './russianStageNames';
import {FRENCH_STAGE_NAMES} from './frenchStageNames';
import {ARABIC_STAGE_NAMES} from './arabicStageNames';
import type {ActiveLocale} from './i18n';

const NAMES={es:SPANISH_STAGE_NAMES,ru:RUSSIAN_STAGE_NAMES,fr:FRENCH_STAGE_NAMES,ar:ARABIC_STAGE_NAMES} as const;

/** The stage's own name in the player's language (every stage has one in all six). */
export function stageDisplayName(stage:number,locale:ActiveLocale):string{
  const s=CAMPAIGN_STAGES.find(x=>x.id===stage)||CAMPAIGN_STAGES[0];
  if(locale==='he')return s.nameHe;
  if(locale==='en')return s.nameEn;
  return NAMES[locale][s.id]||s.nameEn;
}
