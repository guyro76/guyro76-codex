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
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#42218F'};
export default function RootLayout({children}:{children:ReactNode}){
 return <html lang='he' dir='rtl'><body style={{margin:0,fontFamily:'Arial,sans-serif',fontWeight:800,background:'#111f50',color:'#fff'}}>{children}</body></html>;
}