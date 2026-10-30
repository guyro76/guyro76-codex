import type {Metadata,Viewport} from 'next';
import type {ReactNode} from 'react';

/* A browser-installable, ad-free, payment-free five-day product evaluation. */
export const metadata:Metadata={
 title:'טריוויה ריבועים · Trivia Squares',
 description:'טריוויה ריבועים: חברו נקודות, ענו על שאלות טריוויה וכבשו ריבועים.',
 applicationName:'טריוויה ריבועים',
 manifest:'/manifest.webmanifest',
 icons:{icon:[{url:'/icon.svg',type:'image/svg+xml'}],shortcut:'/icon.svg'},
 appleWebApp:{capable:true,title:'טריוויה ריבועים',statusBarStyle:'black-translucent'},
 formatDetection:{telephone:false}
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#42218F'};
export default function RootLayout({children}:{children:ReactNode}){
 return <html lang="he" dir="rtl"><body style={{margin:0,fontFamily:'Arial,sans-serif',fontWeight:800,background:'#111f50',color:'#fff'}}>{children}</body></html>;
}
