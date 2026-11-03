/** Photorealistic game art (generated with Gemini image, cut out to transparent WebP).
 *  Files live in /public/art. Player avatars are still stored as their emoji codes for
 *  backwards compatibility with saved profiles; this maps them to the real artwork. */
export type ObjectArt='apple'|'gem'|'cloud'|'planet'|'coin'|'bulb'|'stopwatch'|'flag'|'trophy';
export type AvatarArtName='fox'|'lion'|'panda'|'dragon'|'unicorn'|'crown'|'rocket'|'star'|'owl'|'robot';

export const AVATAR_ART:Record<string,AvatarArtName>={
 '🦊':'fox','🦁':'lion','🐼':'panda','🐲':'dragon','🦄':'unicorn','👑':'crown','🚀':'rocket','⭐':'star','🦉':'owl','🤖':'robot'
};

type ImgProps={size?:number;alt?:string;className?:string};

export function GameImage({name,size=28,alt,className}:ImgProps&{name:ObjectArt|AvatarArtName}){
 return <img src={'/art/'+name+'.webp'} width={size} height={size} alt={alt||''} aria-hidden={alt?undefined:true}
  draggable={false} decoding='async' className={'game-image game-image-'+name+(className?' '+className:'')}/>;
}

/** Renders the player's avatar as real artwork when one exists, otherwise the stored symbol. */
export function AvatarArt({avatar,size=32,alt,className}:ImgProps&{avatar:string}){
 const name=AVATAR_ART[avatar];
 if(!name)return <span className={className} aria-hidden={alt?undefined:true}>{avatar}</span>;
 return <GameImage name={name} size={size} alt={alt} className={'avatar-art'+(className?' '+className:'')}/>;
}
