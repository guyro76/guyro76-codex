/** Keep Safari's origin-bound localStorage, saved name, board and question
 * history on a single public origin rather than unique Vercel deployment URLs.
 * Preserve query strings including room invitations. Preview engineers may
 * explicitly set qa-preview=1 to check a deployment without redirecting. */
export const TRIVIA_CANONICAL_ORIGIN='https://trivia-squares.vercel.app';
export function canonicalTriviaDestination(urlText:string):string|null{
 try{
  const url=new URL(urlText);
  const host=url.hostname.toLowerCase();
  if(!/^trivia-squares-[a-z0-9-]+\.vercel\.app$/.test(host) ||
     host==='trivia-squares.vercel.app' ||
     url.searchParams.get('qa-preview')==='1')return null;
  const target=new URL(url.pathname+url.search+url.hash,TRIVIA_CANONICAL_ORIGIN);
  return target.href;
 }catch{return null;}
}
