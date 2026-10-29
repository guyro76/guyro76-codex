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
function condition(code:number,day:number,en:boolean){
 if(code===0)return en?'Clear':'בהיר';
 if(code===1||code===2)return en?'Partly cloudy':'מעונן חלקית';
 if(code===3)return en?'Cloudy':'מעונן';
 if(code>=45&&code<=48)return en?'Fog':'ערפל';
 if(code>=51&&code<=67)return en?'Rain':'גשום';
 if(code>=71&&code<=77)return en?'Snow':'שלג';
 if(code>=80&&code<=82)return en?'Showers':'ממטרים';
 if(code>=95)return en?'Thunderstorms':'סופות רעמים';
 return en?'Variable':'משתנה';
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
 const en=locale==='en';
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
 const date=now?new Intl.DateTimeFormat(en?'en-GB':'he-IL',{timeZone:zone,day:'2-digit',month:'2-digit',year:'numeric'}).format(now):'--/--/----';
 const clock=now?new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now):'--:--:--';
 const hebrew=now&&!en?new Intl.DateTimeFormat('he-IL-u-ca-hebrew',{timeZone:zone,day:'numeric',month:'long',year:'numeric'}).format(now):null;
 const built=builtAt&&Number.isFinite(Date.parse(builtAt))?new Intl.DateTimeFormat(en?'en-GB':'he-IL',{timeZone:zone,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(builtAt)):null;
 return <section className='game-timebar' dir={en?'ltr':'rtl'} aria-label={en?'Game status: time, date, weather and version':'נתוני המשחק: שעה, תאריך, מזג אוויר וגרסה'}>
   <div className='game-live-clock' dir='ltr'>
     <span className='game-status-kicker'>{en?'CURRENT TIME · ISRAEL':'שעון ישראל'}</span>
     <time suppressHydrationWarning dateTime={now?.toISOString()} aria-label={en?'Time in Israel':'השעה בישראל'}>{clock}</time>
     <strong dir={en?'ltr':'rtl'}>{date}</strong>
     {hebrew&&<small lang='he' dir='rtl'>{hebrew}</small>}
   </div>
   <div className='game-weather' dir={en?'ltr':'rtl'}>
     <label className='game-status-kicker' htmlFor='game-weather-city'>{en?'WEATHER IN ISRAEL':'מזג האוויר'}</label>
     <select id='game-weather-city' value={cityId} onChange={e=>onCityChange(e.target.value)}>
       {cities.map(city=><option key={city.id} value={city.id}>{en?city.en:city.he}</option>)}
     </select>
     <strong className='game-weather-display' aria-live='polite'>
       {weatherLoading
        ? en?'Loading weather…':'טוען מזג אוויר…'
        : weatherError||!weather
         ? en?'Weather unavailable':'מזג אוויר אינו זמין כרגע'
         : weatherIcon(weather.weather_code,weather.is_day)+' '+Math.round(weather.temperature_2m)+'°C · '+condition(weather.weather_code,weather.is_day,en)}
     </strong>
     <a className='game-weather-source' href='https://open-meteo.com/' target='_blank' rel='noopener noreferrer'>
       {en?'Weather: Open-Meteo':'נתוני מזג אוויר: Open-Meteo'}
     </a>
   </div>
   <div className='game-version' dir={en?'ltr':'rtl'}>
     <span className='game-status-kicker'>{en?'GAME VERSION':'גרסת המשחק'}</span>
     <strong data-testid='trivia-version'>v{packageJson.version}</strong>
     {built&&<small>{en?'Updated':'עודכן'}: {built}</small>}
     <a href='#app-footer'>{en?'Developer credit':'קרדיט ומידע על היוצר'}</a>
   </div>
 </section>;
}
