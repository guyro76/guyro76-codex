import type {ActiveLocale} from '../lib/i18n';
import type {AnswerImage as Img} from '../lib/answerImages';

const W:Record<ActiveLocale,{photo:string;work:string;pd:string;resized:string;source:string}>={
  he:{photo:'צילום',work:'יצירה',pd:'נחלת הכלל',resized:'הוקטן',source:'ויקישיתוף'},
  en:{photo:'Photo',work:'Work',pd:'Public domain',resized:'resized',source:'Wikimedia Commons'},
  ru:{photo:'Фото',work:'Работа',pd:'Общественное достояние',resized:'уменьшено',source:'Викисклад'},
  fr:{photo:'Photo',work:'Œuvre',pd:'Domaine public',resized:'redimensionnée',source:'Wikimedia Commons'},
  ar:{photo:'تصوير',work:'عمل',pd:'ملكية عامة',resized:'مصغّرة',source:'ويكيميديا كومنز'},
  es:{photo:'Foto',work:'Obra',pd:'Dominio público',resized:'reducida',source:'Wikimedia Commons'}
};

/** A free-licensed photo next to the correct answer, with the photographer's credit underneath. */
export default function AnswerImage({image,alt,locale,compact=false}:{image:Img;alt:string;locale:ActiveLocale;compact?:boolean}){
  const w=W[locale]||W.he;
  const pd=image.license==='Public domain';
  return <figure className={'answer-image'+(compact?' compact':'')}>
    <img src={image.src} width={image.w} height={image.h} alt={alt} loading='lazy' decoding='async'/>
    <figcaption>
      {pd?w.work:w.photo}: <bdi>{image.author}</bdi>
      {' · '}{pd?w.pd:image.licenseUrl?<a href={image.licenseUrl} target='_blank' rel='noopener noreferrer'>{image.license}</a>:image.license}
      {!pd&&<> ({w.resized})</>}
      {' · '}<a href={image.page} target='_blank' rel='noopener noreferrer'>{w.source}</a>
    </figcaption>
  </figure>;
}
