'use client';
import {useEffect,useState} from 'react';
import type {ActiveLocale} from '../lib/i18n';
import packageJson from '../../package.json';

const zone='Asia/Jerusalem';
const builtAt=process.env.NEXT_PUBLIC_TRIVIA_BUILD_AT||'';
type City={id:string;he:string;en:string;lat:number;lon:number};
const cities:readonly City[]=[
 {id:'harish',he:'חריש',en:'Harish',lat:32.462,lon:35.043},
 {id:'telaviv',he:'תל אביב',en:'Tel Aviv',lat:32.0853,lon:34.7818},
 {id:'jerusalem',he:'ירושלים',en:'Jerusalem',lat:31.7683,lon:35.2137},
 {id:'haifa',he:'חיפה',en:'Haifa',lat:32.794,lon:34.9896},
 {id:'beersheva',he:'באר שבע',en:'Beersheba',lat:31.2518,lon:34.7913},
 {id:'eilat',he:'אילת',en:'Eilat',lat:29.5577,lon:34.9519}
];
type CurrentWeather={temperature_2m:number;weather_code:number;is_day:number};
type WeatherName='Clear'|'Partly cloudy'|'Cloudy'|'Fog'|'Rain'|'Snow'|'Showers'|'Thunderstorms'|'Variable';
const weatherTranslations:Record<ActiveLocale,Record<WeatherName,string>>={
 he:{Clear:'בהיר','Partly cloudy':'מעונן חלקית',Cloudy:'מעונן',Fog:'ערפל',Rain:'גשום',Snow:'שלג',Showers:'ממטרים',Thunderstorms:'סופות רעמים',Variable:'משתנה'},
 en:{Clear:'Clear','Partly cloudy':'Partly cloudy',Cloudy:'Cloudy',Fog:'Fog',Rain:'Rain',Snow:'Snow',Showers:'Showers',Thunderstorms:'Thunderstorms',Variable:'Variable'},
 ru:{Clear:'Ясно','Partly cloudy':'Переменная облачность',Cloudy:'Облачно',Fog:'Туман',Rain:'Дождь',Snow:'Снег',Showers:'Ливни',Thunderstorms:'Грозы',Variable:'Переменная погода'},
 fr:{Clear:'Dégagé','Partly cloudy':'Partiellement nuageux',Cloudy:'Nuageux',Fog:'Brouillard',Rain:'Pluie',Snow:'Neige',Showers:'Averses',Thunderstorms:'Orages',Variable:'Variable'},
 ar:{Clear:'صافٍ','Partly cloudy':'غائم جزئيًا',Cloudy:'غائم',Fog:'ضباب',Rain:'ممطر',Snow:'ثلج',Showers:'زخات مطر',Thunderstorms:'عواصف رعدية',Variable:'متغير'},
 es:{Clear:'Despejado','Partly cloudy':'Parcialmente nublado',Cloudy:'Nublado',Fog:'Niebla',Rain:'Lluvia',Snow:'Nieve',Showers:'Chubascos',Thunderstorms:'Tormentas',Variable:'Variable'}
};
const labels:Record<ActiveLocale,{area:string;time:string;weather:string;loading:string;unavailable:string;source:string;version:string;updated:string;credit:string;status:string;}>={
 he:{area:'שעון ישראל',time:'השעה בישראל',weather:'מזג האוויר',loading:'טוען מזג אוויר…',unavailable:'מזג אוויר אינו זמין כרגע',source:'נתוני מזג אוויר: Open-Meteo',version:'גרסת המשחק',updated:'עודכן',credit:'קרדיט ומידע על היוצר',status:'נתוני המשחק: שעה, תאריך, מזג אוויר וגרסה'},
 en:{area:'CURRENT TIME · ISRAEL',time:'Time in Israel',weather:'WEATHER IN ISRAEL',loading:'Loading weather…',unavailable:'Weather unavailable',source:'Weather: Open-Meteo',version:'GAME VERSION',updated:'Updated',credit:'Developer credit',status:'Game status: time, date, weather and version'},
 ru:{area:'ВРЕМЯ В ИЗРАИЛЕ',time:'Время в Израиле',weather:'ПОГОДА В ИЗРАИЛЕ',loading:'Загрузка погоды…',unavailable:'Погода недоступна',source:'Погода: Open-Meteo',version:'ВЕРСИЯ ИГРЫ',updated:'Обновлено',credit:'Сведения о разработчике',status:'Игровой статус: время, дата, погода и версия'},
 fr:{area:'HEURE EN ISRAËL',time:'Heure en Israël',weather:'MÉTÉO EN ISRAËL',loading:'Chargement de la météo…',unavailable:'Météo indisponible',source:'Météo : Open-Meteo',version:'VERSION DU JEU',updated:'Mis à jour',credit:'Crédits du créateur',status:'État du jeu : heure, date, météo et version'},
 ar:{area:'الوقت في إسرائيل',time:'الوقت في إسرائيل',weather:'الطقس في إسرائيل',loading:'جارٍ تحميل الطقس…',unavailable:'الطقس غير متاح',source:'الطقس: Open-Meteo',version:'إصدار اللعبة',updated:'تم التحديث',credit:'معلومات عن المطوّر',status:'حالة اللعبة: الوقت والتاريخ والطقس والإصدار'},
 es:{area:'HORA EN ISRAEL',time:'Hora en Israel',weather:'TIEMPO EN ISRAEL',loading:'Cargando el tiempo…',unavailable:'Tiempo no disponible',source:'Datos meteorológicos: Open-Meteo',version:'VERSIÓN DEL JUEGO',updated:'Actualizado',credit:'Créditos del creador',status:'Estado del juego: hora, fecha, tiempo y versión'}
};
const cityTranslations:Record<'ru'|'fr'|'ar'|'es',Record<string,string>>={
 ru:{harish:'Хариш',telaviv:'Тель-Авив',jerusalem:'Иерусалим',haifa:'Хайфа',beersheva:'Беэр-Шева',eilat:'Эйлат'},
 fr:{harish:'Harish',telaviv:'Tel-Aviv',jerusalem:'Jérusalem',haifa:'Haïfa',beersheva:'Beer-Sheva',eilat:'Eilat'},
 ar:{harish:'حريش',telaviv:'تل أبيب',jerusalem:'القدس',haifa:'حيفا',beersheva:'بئر السبع',eilat:'إيلات'},
 es:{harish:'Harish',telaviv:'Tel Aviv',jerusalem:'Jerusalén',haifa:'Haifa',beersheva:'Beerseba',eilat:'Eilat'}
};
function condition(code:number,locale:ActiveLocale){
 let name:WeatherName='Variable';
 if(code===0)name='Clear';
 else if(code===1||code===2)name='Partly cloudy';
 else if(code===3)name='Cloudy';
 else if(code>=45&&code<=48)name='Fog';
 else if(code>=51&&code<=67)name='Rain';
 else if(code>=71&&code<=77)name='Snow';
 else if(code>=80&&code<=82)name='Showers';
 else if(code>=95)name='Thunderstorms';
 return weatherTranslations[locale][name];
}
function weatherIcon(code:number,day:number){
 if(code===0)return day===1?'☀️':'🌙';
 if(code<=3)return '⛅';
 if(code<=48)return '🌫️';
 if(code<=67)return '🌧️';
 if(code<=77)return '❄️';
 if(code<=82)return '🌦️';
 return '⛈️';
}
export default function GameTimeBar({locale}:{locale:ActiveLocale}){
 const [now,setNow]=useState<Date|null>(null);
 const [cityId,setCityId]=useState('harish');
 const [weather,setWeather]=useState<CurrentWeather|null>(null);
 const [weatherError,setWeatherError]=useState(false);
 const [weatherLoading,setWeatherLoading]=useState(true);
 const rtl=locale==='he'||locale==='ar';
 const words=labels[locale];
 useEffect(()=>{
   setNow(new Date());
   const timer=window.setInterval(()=>setNow(new Date()),1000);
   try{const value=localStorage.getItem('trivia-weather-city');if(cities.some(c=>c.id===value))setCityId(value!)}catch{}
   return()=>window.clearInterval(timer);
 },[]);
 useEffect(()=>{
   const city=cities.find(c=>c.id===cityId)||cities[0];
   let active=true;
   const update=async()=>{
     if(!active)return;
     try{
       const cacheKey='trivia-weather-v1-'+city.id;
       const cached=localStorage.getItem(cacheKey);
       if(cached){
         const parsed=JSON.parse(cached) as {weather:CurrentWeather;timestamp:number};
         if(Date.now()-parsed.timestamp<35*60*1000&&Number.isFinite(parsed.weather?.temperature_2m)){
           if(active){setWeather(parsed.weather);setWeatherLoading(false);setWeatherError(false)}
           return;
         }
       }
       setWeatherLoading(true);
       const url='https://api.open-meteo.com/v1/forecast?latitude='+city.lat+'&longitude='+city.lon+
         '&current=temperature_2m,weather_code,is_day&timezone=Asia%2FJerusalem';
       const response=await fetch(url,{cache:'no-store'});
       if(!response.ok)throw new Error('Weather unavailable');
       const body=await response.json() as {current?:CurrentWeather};
       const data=body.current;
       if(!data||!Number.isFinite(data.temperature_2m)||!Number.isFinite(data.weather_code))throw new Error('Invalid weather');
       if(active){setWeather(data);setWeatherError(false);setWeatherLoading(false)}
       try{localStorage.setItem(cacheKey,JSON.stringify({weather:data,timestamp:Date.now()}))}catch{}
     }catch{
       if(active){setWeather(null);setWeatherError(true);setWeatherLoading(false)}
     }
   };
   void update();
   const timer=window.setInterval(()=>void update(),40*60*1000);
   return()=>{active=false;window.clearInterval(timer)};
 },[cityId]);
 const onCityChange=(next:string)=>{
   setWeather(null);setWeatherLoading(true);
   setCityId(next);
   try{localStorage.setItem('trivia-weather-city',next)}catch{}
 };
 const intlLocale=locale==='he'?'he-IL':locale==='en'?'en-GB':locale==='ru'?'ru-RU':locale==='fr'?'fr-FR':locale==='es'?'es-ES':'ar-EG-u-ca-gregory';
 const date=now?new Intl.DateTimeFormat(intlLocale,{timeZone:zone,day:'2-digit',month:'2-digit',year:'numeric'}).format(now):'--/--/----';
 const clock=now?new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now):'--:--:--';
 const hebrew=now&&locale==='he'?new Intl.DateTimeFormat('he-IL-u-ca-hebrew',{timeZone:zone,day:'numeric',month:'long',year:'numeric'}).format(now):null;
 const built=builtAt&&Number.isFinite(Date.parse(builtAt))?new Intl.DateTimeFormat(intlLocale,{timeZone:zone,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(builtAt)):null;
 return <section className='game-timebar' dir={rtl?'rtl':'ltr'} aria-label={words.status}>
   <div className='game-live-clock' dir='ltr'>
     <span className='game-status-kicker'>{words.area}</span>
     <time suppressHydrationWarning dateTime={now?.toISOString()} aria-label={words.time}>{clock}</time>
     <strong dir={rtl?'rtl':'ltr'}>{date}</strong>
     {hebrew&&<small lang='he' dir='rtl'>{hebrew}</small>}
   </div>
   <div className='game-weather' dir={rtl?'rtl':'ltr'}>
     <label className='game-status-kicker' htmlFor='game-weather-city'>{words.weather}</label>
     <select id='game-weather-city' value={cityId} onChange={e=>onCityChange(e.target.value)}>
       {cities.map(city=><option key={city.id} value={city.id}>{locale==='he'?city.he:locale==='en'?city.en:cityTranslations[locale][city.id]}</option>)}
     </select>
     <strong className='game-weather-display' aria-live='polite'>
       {weatherLoading?words.loading:weatherError||!weather?words.unavailable:
         weatherIcon(weather.weather_code,weather.is_day)+' '+Math.round(weather.temperature_2m)+'°C · '+condition(weather.weather_code,locale)}
     </strong>
     <a className='game-weather-source' href='https://open-meteo.com/' target='_blank' rel='noopener noreferrer'>{words.source}</a>
   </div>
   <div className='game-version' dir={rtl?'rtl':'ltr'}>
     <span className='game-status-kicker'>{words.version}</span>
     <strong data-testid='trivia-version'>v{packageJson.version}</strong>
     {built&&<small>{words.updated}: {built}</small>}
     <a href='#app-footer'>{words.credit}</a>
   </div>
 </section>;
}
