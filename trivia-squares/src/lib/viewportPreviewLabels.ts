import type {ActiveLocale} from './i18n';
export type ViewportMode='auto'|'desktop'|'tablet'|'mobile';

const labels:Record<ActiveLocale,{title:string;options:Record<ViewportMode,string>}>={
 he:{title:'בדיקת תצוגה במכשירים',options:{auto:'אוטומטי',desktop:'מחשב',tablet:'טאבלט',mobile:'נייד'}},
 en:{title:'Device viewport preview',options:{auto:'Auto',desktop:'Desktop',tablet:'Tablet',mobile:'Mobile'}},
 ru:{title:'Предпросмотр на устройствах',options:{auto:'Авто',desktop:'Компьютер',tablet:'Планшет',mobile:'Телефон'}},
 fr:{title:'Aperçu selon l’appareil',options:{auto:'Auto',desktop:'Ordinateur',tablet:'Tablette',mobile:'Mobile'}},
 ar:{title:'معاينة العرض حسب الجهاز',options:{auto:'تلقائي',desktop:'حاسوب',tablet:'جهاز لوحي',mobile:'هاتف'}},
 es:{title:'Vista previa por dispositivo',options:{auto:'Automático',desktop:'Ordenador',tablet:'Tableta',mobile:'Móvil'}}
};
export function viewportPreviewLabel(locale:ActiveLocale):string{return labels[locale].title;}
export function viewportModeLabel(locale:ActiveLocale,mode:ViewportMode):string{return labels[locale].options[mode];}
