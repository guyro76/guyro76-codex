import type {MetadataRoute} from 'next';

/** Installable browser app. Pilot is free, without advertising or checkout. */
export default function manifest():MetadataRoute.Manifest{
  return {
    id:'/',
    name:'טריוויה ריבועים · Trivia Squares',
    short_name:'טריוויה ריבועים',
    description:'משחק טריוויה: מציירים קווים, עונים נכון וכובשים ריבועים',
    start_url:'/',
    scope:'/',
    display:'standalone',
    orientation:'any',
    background_color:'#0B1737',
    theme_color:'#42218F',
    lang:'he',
    dir:'rtl',
    categories:['games','entertainment','education'],
    icons:[
      {src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},
      {src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'maskable'}
    ]
  };
}
