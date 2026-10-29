'use client';
import type { KeyboardEvent } from 'react';

export type CaptureStyle = 'lumen' | 'neon' | 'seal' | 'prism' | 'token';

type Props = {
  row: number; col: number; x: number; y: number; width: number; height: number;
  color: string; name: string; icon: string; style: CaptureStyle;
  selectable?: boolean; onSelect?: () => void; locale: 'he' | 'en';
};

export default function CaptureTile({row,col,x,y,width,height,color,name,icon,style,selectable=false,onSelect,locale}:Props) {
  const id = 'capture-' + row + '-' + col;
  const cx = x + width / 2, cy = y + height / 2;
  const radius = Math.min(width,height) * .265;
  const mark = (name.trim().slice(0,1) || '★').toLocaleUpperCase();
  const textSize = Math.max(12,Math.min(28,radius*.94));
  const hitLabel = locale==='he'
    ? 'שינוי בעלות על ריבוע בשורה '+(row+1)+' עמודה '+(col+1)+'. שייך ל'+name
    : 'Change owner of square row '+(row+1)+' column '+(col+1)+'. Currently '+name;
  const onKeyDown=(event:KeyboardEvent<SVGGElement>)=>{
    if(selectable && (event.key==='Enter' || event.key===' ')){event.preventDefault();event.stopPropagation();onSelect?.()}
  };
  return <g className={'capture-tile capture-style-'+style} data-square={row+'-'+col}
    data-capture-style={style} data-owner={name}
    role={selectable?'button':undefined} tabIndex={selectable?0:undefined}
    aria-label={selectable?hitLabel:undefined} onClick={selectable?onSelect:undefined}
    onKeyDown={selectable?onKeyDown:undefined}
    style={{cursor:selectable?'pointer':undefined}}>
    <defs>
      <linearGradient id={id+'-face'} x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stopColor={color} stopOpacity={style==='neon'?'.32':'.65'}/>
        <stop offset='50%' stopColor='#111E42' stopOpacity='.88'/>
        <stop offset='100%' stopColor={color} stopOpacity='.55'/>
      </linearGradient>
      <linearGradient id={id+'-metal'} x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stopColor='#FFFFFF' stopOpacity='.9'/>
        <stop offset='38%' stopColor={color} stopOpacity='.7'/>
        <stop offset='85%' stopColor='#FFFFFF' stopOpacity='.3'/>
        <stop offset='100%' stopColor={color} stopOpacity='.9'/>
      </linearGradient>
    </defs>
    <rect className='capture-face' x={x} y={y} width={width} height={height} rx={Math.min(12,width*.16)}
      fill={'url(#'+id+'-face)'} stroke={color} strokeWidth={style==='neon'?2.7:1.5} />
    <rect className='capture-inset' x={x+3} y={y+3} width={width-6} height={height-6}
      rx={Math.min(10,width*.14)} fill='none' stroke={'url(#'+id+'-metal)'} strokeWidth='.9'/>
    {style==='neon' && <rect x={x+5} y={y+5} width={width-10} height={height-10}
      rx='8' stroke={color} strokeOpacity='.65' strokeWidth='1.3' fill='none' className='capture-neon-ring'/>}
    {style==='prism' && <path d={'M'+x+' '+(y+height*.66)+' L'+(x+width*.7)+' '+y+' L'+(x+width)+' '+y+
      ' L'+(x+width*.26)+' '+(y+height)+' Z'} fill='#FFFFFF' opacity='.065'/>}
    {style==='seal'
      ? <path d={Array.from({length:16},(_,i)=>{const a=i*Math.PI/8-Math.PI/2;const rr=i%2?radius*.96:radius*1.13;return (i?'L':'M')+(cx+Math.cos(a)*rr).toFixed(1)+' '+(cy+Math.sin(a)*rr).toFixed(1)}).join(' ')+'Z'}
        fill='#101B3B' stroke={'url(#'+id+'-metal)'} strokeWidth='2.2' className='capture-medallion'/>
      : <circle className='capture-medallion' cx={cx} cy={cy} r={radius}
        fill='#101B3B' fillOpacity='.94' stroke={'url(#'+id+'-metal)'} strokeWidth={style==='token'?2.5:1.8}/>}
    <circle cx={cx} cy={cy} r={radius*.82} stroke={color} strokeOpacity='.56' fill='none' strokeWidth='.7'/>
    <text className='capture-mark' x={cx} y={cy + textSize*.36} fontSize={style==='token'?Math.min(30,radius*1.15):textSize}
      textAnchor='middle' fontWeight='900' fill='#FFFFFF' aria-hidden='true'>{style==='token'?icon:mark}</text>
    {style!=='token' && <>
      <path d={'M'+(cx-radius*.55)+' '+(cy+radius*.61)+' H'+(cx+radius*.55)} stroke={color} strokeOpacity='.9' strokeWidth='1.2'/>
      <circle cx={x+width*.17} cy={y+height*.19} r='1.8' fill='#FFFFFF' className='capture-spark'/>
      <circle cx={x+width*.82} cy={y+height*.77} r='1.4' fill='#FFFFFF' className='capture-spark'/>
    </>}
    {selectable && <rect x={x} y={y} width={width} height={height} rx='10' fill='transparent'/>}
  </g>;
}
