import type {Metadata,Viewport} from 'next';
import type {ReactNode} from 'react';
import './fonts.css';
import ServiceWorkerRegister from '../components/ServiceWorkerRegister';

const APP_NAME='טריוויה ריבועים';
const SITE_URL='https://trivia-squares.vercel.app';
const DESCRIPTION='משחק טריוויה: מחברים נקודות, עונים נכון וכובשים ריבועים. 200 שלבים, 6 שפות, נגד המחשב או נגד חבר.';
export const metadata:Metadata={
  metadataBase:new URL(SITE_URL),
  title:APP_NAME,
  description:DESCRIPTION,
  applicationName:APP_NAME,
  manifest:'/manifest.webmanifest',
  alternates:{canonical:'/'},
  appleWebApp:{capable:true,title:APP_NAME,statusBarStyle:'black-translucent'},
  icons:{icon:[{url:'/icon.svg',type:'image/svg+xml'},{url:'/icon-192.png',type:'image/png',sizes:'192x192'}],shortcut:'/icon.svg',apple:'/apple-icon.png'},
  formatDetection:{telephone:false},
  openGraph:{type:'website',url:SITE_URL,siteName:APP_NAME,title:APP_NAME,description:DESCRIPTION,locale:'he_IL',
   alternateLocale:['en_US','ru_RU','fr_FR','ar_AR','es_ES'],
   images:[{url:'/og-image.png',width:1200,height:630,alt:'טריוויה ריבועים – לוח המשחק'}]},
  twitter:{card:'summary_large_image',title:APP_NAME,description:DESCRIPTION,images:['/og-image.png']},
  robots:{index:true,follow:true}
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#0A0E24',colorScheme:'dark'};
export default function RootLayout({children}:{children:ReactNode}){
 return <html lang='he' dir='rtl' suppressHydrationWarning>
  <head>
   {/* Returning players skip the welcome screen; decided before the first paint (see app/page.tsx). */}
   <script dangerouslySetInnerHTML={{__html:"(function(){try{var l=localStorage,r=l.getItem('trivia-welcome-dismissed-v1')==='1'||l.getItem('trivia-stage-started-v1')==='true'||Number(l.getItem('trivia-stage-id-v1')||'1')>1;if(!r){var g=JSON.parse(l.getItem('trivia-local-game-v1')||'null');r=!!(g&&typeof g==='object'&&(Object.keys(g.edges||{}).length||Object.keys(g.owners||{}).length))}if(r)document.documentElement.classList.add('ts-returning')}catch(e){}})()"}}/>
   <style dangerouslySetInnerHTML={{__html:'.ts-entry-wait{display:none}html.ts-returning .ts-entry-welcome{display:none!important}html.ts-returning .ts-entry-wait{display:contents}'}}/>
   <link rel='preload' href='/fonts/rubik-hebrew.woff2' as='font' type='font/woff2' crossOrigin=''/>
   <link rel='preload' href='/fonts/rubik-latin.woff2' as='font' type='font/woff2' crossOrigin=''/>
   <link rel='preload' href='/art/fox.webp' as='image' type='image/webp' fetchPriority='high'/>
  </head>
  <body style={{margin:0,fontFamily:"'Rubik',system-ui,-apple-system,'Segoe UI',Arial,sans-serif",fontWeight:800,background:'#0A0E24',color:'#fff'}}>{children}<ServiceWorkerRegister/></body></html>;
}
