import type {ActiveLocale} from './i18n';

type CaptureLabelParams = {row:number; col:number; name:string; selectable:boolean};

/** Screen-reader text for captured board squares in all six supported languages.
 * Keep the player's saved display name unmodified, including RTL names.
 */
export function captureTileA11yLabel(locale:ActiveLocale,{row,col,name,selectable}:CaptureLabelParams):string {
  const r=row+1, c=col+1;
  const labels:Record<ActiveLocale,{select:string;owned:string}>={
    he:{select:`שינוי בעלות על ריבוע בשורה ${r}, עמודה ${c}. הבעלים הנוכחי: ${name}`,
        owned:`ריבוע בשורה ${r}, עמודה ${c}, שייך ל${name}`},
    en:{select:`Change owner of square at row ${r}, column ${c}. Current owner: ${name}`,
        owned:`Square at row ${r}, column ${c}, owned by ${name}`},
    ru:{select:`Изменить владельца клетки в строке ${r}, столбце ${c}. Текущий владелец: ${name}`,
        owned:`Клетка в строке ${r}, столбце ${c}, принадлежит ${name}`},
    fr:{select:`Changer le propriétaire de la case ligne ${r}, colonne ${c}. Propriétaire actuel : ${name}`,
        owned:`Case ligne ${r}, colonne ${c}, appartenant à ${name}`},
    ar:{select:`تغيير مالك المربع في الصف ${r} والعمود ${c}. المالك الحالي: ${name}`,
        owned:`المربع في الصف ${r} والعمود ${c} ملك ${name}`},
    es:{select:`Cambiar el dueño de la casilla en la fila ${r}, columna ${c}. Dueño actual: ${name}`,
        owned:`Casilla en la fila ${r}, columna ${c}, pertenece a ${name}`}
  };
  return labels[locale][selectable?'select':'owned'];
}
