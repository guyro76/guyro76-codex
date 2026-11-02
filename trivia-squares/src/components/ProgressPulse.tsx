'use client';
import type {ActiveLocale} from '../lib/i18n';

type Props={locale:ActiveLocale;stage:number;captured:number;streak:number};
const copy={
 he:{title:'המסע שלך',stage:'שלב',squares:'ריבועים שנכבשו',streak:'רצף',next:'היעד הבא',done:'הושלם',milestone:'כיבושים'},
 en:{title:'Your journey',stage:'Stage',squares:'Captured squares',streak:'Streak',next:'Next milestone',done:'Complete',milestone:'captures'},
 es:{title:'Tu aventura',stage:'Nivel',squares:'Casillas ganadas',streak:'Racha',next:'Próximo objetivo',done:'Completado',milestone:'conquistas'},
 fr:{title:'Votre parcours',stage:'Niveau',squares:'Cases conquises',streak:'Série',next:'Prochain objectif',done:'Terminé',milestone:'conquêtes'},
 ru:{title:'Ваш путь',stage:'Уровень',squares:'Захвачено клеток',streak:'Серия',next:'Следующая цель',done:'Готово',milestone:'захватов'},
 ar:{title:'رحلتك',stage:'المرحلة',squares:'مربعات محتلة',streak:'سلسلة',next:'الهدف التالي',done:'مكتمل',milestone:'مربعات'}
} as const;
export default function ProgressPulse({locale,stage,captured,streak}:Props){
 const t=copy[locale]||copy.en;
 const count=Math.max(0,Math.floor(captured));
 const next=Math.max(3,Math.ceil((count+1)/3)*3);
 const previous=next-3;
 const progress=Math.max(0,Math.min(100,((count-previous)/3)*100));
 const combo=streak>=10?10:streak>=5?5:streak>=3?3:0;
 return <section className='progress-pulse' aria-label={t.title}>
  <div className='progress-pulse-heading'><strong>{t.title}</strong><span>{t.stage} {stage}</span></div>
  {combo>0 && <div className={'progress-pulse-combo combo-tier-'+combo} role='status' aria-live='polite'><span aria-hidden='true'>✦</span> COMBO x{Math.floor(streak)} <span aria-hidden='true'>✦</span></div>}
  <div className='progress-pulse-stats'>
   <span>{t.squares}: <strong>{count}</strong></span>
   <span>{t.streak}: <strong>{Math.max(0,Math.floor(streak))}</strong></span>
  </div>
  <div className='progress-pulse-goal'><span>{t.next}: {next} {t.milestone}</span><strong>{count}/{next}</strong></div>
  <div className='progress-pulse-track' role='progressbar' aria-valuemin={previous} aria-valuemax={next} aria-valuenow={count} aria-label={t.next}>
   <div className='progress-pulse-fill' style={{width:progress+'%'}}/>
  </div>
 </section>;
}
