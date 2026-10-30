'use client';
import type { KeyboardEvent } from 'react';
import type {ActiveLocale} from '../lib/i18n';

export type CaptureStyle = 'lumen' | 'neon' | 'seal' | 'prism' | 'token';

type Props = {
  row: number; col: number; x: number; y: number; width: number; height: number;
  color: string; name: string; icon: string; style: CaptureStyle;
  selectable?: boolean; onSelect?: () => void; locale: ActiveLocale; idPrefix?: string;
};

export default function CaptureTile({row,col,x,y,width,height,color,name,icon,style,selectable=false,onSelect,locale,idPrefix='board'}:Props) {
  const id = idPrefix+'-capture-' + row + '-' + col;
  const cx = x + width / 2, cy = y + height / 2;
  const radius = Math.min(width,height) * .265;
  const mark = (name.trim().slice(0,1) || '★').toLocaleUpperCase();
  // Show the player's saved name on every captured square, never the avatar emoji.
  // Scale long player names to the available cell width without changing ownership or save data.
  const label = name.trim() || mark;
  const textSize = Math.max(9,Math.min(18,(width-14)/Math.max(1.8,Array.from(label).length*.66)));
  const textWidth = Math.min(width-12,Math.max(24,Array.from(label).length*textSize*.7));
  const corner = Math.min(12,width*.16);
  const sparkles=Array.from({length:8},(_,i)=>{
    const angle=(i*2*Math.PI)/8-Math.PI/2;
    const reach=Math.min(width,height)*.38;
    return {x:cx+Math.cos(angle)*reach,y:cy+Math.sin(angle)*reach,r:i%2===0?1.8:1.1};
  });
  const hitLabel = locale==='he'
    ? 'שינוי בעלות על ריבוע בשורה '+(row+1)+' עמודה '+(col+1)+'. שייך ל'+name
    : 'Change owner of square row '+(row+1)+' column '+(col+1)+'. Currently '+name;
  const onKeyDown=(event:KeyboardEvent<SVGGElement>)=>{
    if(selectable && (event.key==='Enter' || event.key===' ')){event.preventDefault();event.stopPropagation();onSelect?.()}
  };
  return <g className={'capture-tile capture-style-'+style} data-square={row+'-'+col}
    data-capture-style={style} data-owner={name}
    role={selectable?'button':'img'} tabIndex={selectable?0:undefined}
    aria-label={selectable?hitLabel:(locale==='he'?'הריבוע של '+name:'Square claimed by '+name)} onClick={selectable?onSelect:undefined}
    onKeyDown={selectable?onKeyDown:undefined}
    style={{cursor:selectable?'pointer':undefined}}>
    <defs>
      <linearGradient id={id+'-face'} x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stopColor={color} stopOpacity={style==='neon'?'.32':'.65'}/>
        <stop offset='50%' stopColor='#111E42' stopOpacity='.88'/>
        <stop offset='100%' stopColor={color} stopOpacity='.55'/>
      </linearGradient>
      <clipPath id={id+'-vessel'}><rect x={x+1.5} y={y+1.5} width={width-3} height={height-3} rx={corner}/></clipPath>
      <linearGradient id={id+'-liquid'} x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#FFFFFF' stopOpacity='.66'/>
        <stop offset='14%' stopColor={color} stopOpacity='.93'/>
        <stop offset='64%' stopColor={color} stopOpacity='.83'/>
        <stop offset='100%' stopColor='#111A45' stopOpacity='.94'/>
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
    <g clipPath={'url(#'+id+'-vessel)'} pointerEvents='none' aria-hidden='true'>
      <g className='capture-liquid-rise'>
        <rect className='capture-liquid-body' x={x+1.5} y={y+1.5} width={width-3} height={height-3}
          fill={'url(#'+id+'-liquid)'}/>
        <path className='capture-liquid-wave' d={
          'M'+(x-2)+' '+(y+height*.16)+
          ' Q'+(x+width*.23)+' '+(y+height*.03)+' '+(x+width*.5)+' '+(y+height*.14)+
          ' T'+(x+width+2)+' '+(y+height*.12)+
          ' L'+(x+width+2)+' '+(y+height*.28)+
          ' L'+(x-2)+' '+(y+height*.28)+' Z'} fill='#FFFFFF' fillOpacity='.20'/>
        <ellipse className='capture-liquid-sheen' cx={cx} cy={y+height*.18} rx={width*.38} ry={height*.075}
          fill='#FFFFFF' fillOpacity='.15'/>
        <circle className='capture-bubble' cx={x+width*.21} cy={y+height*.67} r={Math.max(1.4,width*.034)} fill='#FFFFFF' fillOpacity='.40'/>
        <circle className='capture-bubble' cx={x+width*.74} cy={y+height*.48} r={Math.max(1.1,width*.026)} fill='#FFFFFF' fillOpacity='.32'/>
        <circle className='capture-bubble' cx={x+width*.58} cy={y+height*.81} r={Math.max(1,width*.02)} fill='#FFFFFF' fillOpacity='.38'/>
      </g>
    </g>
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
    <rect className='capture-name-backplate' x={cx-textWidth/2-4} y={cy-textSize*.9}
      width={textWidth+8} height={textSize*1.8} rx={Math.min(8,textSize*.55)}
      fill='#101B3B' fillOpacity='.95' stroke={color} strokeOpacity='.85' strokeWidth='1' aria-hidden='true'/>
    <text className='capture-mark capture-player-name' x={cx} y={cy+textSize*.34}
      fontSize={textSize} textAnchor='middle' fontWeight='900' fill='#FFFFFF'
      // SVG text-anchor + RTL direction may reverse Hebrew names on iOS Safari.
      // The text content itself is already in logical Unicode order; let its
      // strong RTL characters render naturally inside an LTR SVG text context.
      direction='ltr' style={{unicodeBidi:'plaintext'}}
      textLength={Array.from(label).length*textSize*.7>width-14?width-14:undefined}
      lengthAdjust='spacingAndGlyphs' aria-hidden='true'>{label}</text>
    <g className='capture-firework' aria-hidden='true' pointerEvents='none'>
      {sparkles.map((spark,i)=><circle key={i} className='capture-firework-spark' cx={spark.x} cy={spark.y} r={spark.r}
        fill={i%2===0?'#FFF5B1':'#FFFFFF'} style={{animationDelay:(.67+i*.037)+'s'}}/>)}
    </g>
    {style!=='token' && <>
      <path d={'M'+(cx-radius*.55)+' '+(cy+radius*.61)+' H'+(cx+radius*.55)} stroke={color} strokeOpacity='.9' strokeWidth='1.2'/>
      <circle cx={x+width*.17} cy={y+height*.19} r='1.8' fill='#FFFFFF' className='capture-spark'/>
      <circle cx={x+width*.82} cy={y+height*.77} r='1.4' fill='#FFFFFF' className='capture-spark'/>
    </>}
    {selectable && <rect x={x} y={y} width={width} height={height} rx='10' fill='transparent'/>}
  </g>;
}
