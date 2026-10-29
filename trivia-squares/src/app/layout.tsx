import type { ReactNode } from 'react';
export const metadata = {title:'טריוויה ריבועים',description:'משחק אסטרטגיה וטריוויה'};
export default function RootLayout({children}:{children:ReactNode}){return <html lang='he' dir='rtl'><body style={{margin:0,fontFamily:'Arial,sans-serif',fontWeight:800,background:'#111f50',color:'#fff'}}>{children}</body></html>}
