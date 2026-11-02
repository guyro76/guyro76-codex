import type {Metadata,Viewport} from 'next';
import type {ReactNode} from 'react';

const APP_NAME='טריוויה ריבועים';
export const metadata:Metadata={
  title:APP_NAME,
  description:'משחק טריוויה: מחברים נקודות, עונים נכון וכובשים ריבועים.',
  applicationName:APP_NAME,
  manifest:'/manifest.webmanifest',
  appleWebApp:{capable:true,title:APP_NAME,statusBarStyle:'default'},
  icons:{icon:[{url:'/icon.svg',type:'image/svg+xml'}],shortcut:'/icon.svg'},
  formatDetection:{telephone:false}
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#0A0E24'};
export default function RootLayout({children}:{children:ReactNode}){
 return <html lang='he' dir='rtl'>
  <head>
   <link rel='preconnect' href='https://fonts.googleapis.com'/>
   <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin=''/>
   <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Rubik:wght@600;700;800;900&display=swap'/>
  </head>
  <body style={{margin:0,fontFamily:"'Rubik',system-ui,-apple-system,'Segoe UI',Arial,sans-serif",fontWeight:800,background:'#0A0E24',color:'#fff'}}>{children}</body></html>;
}