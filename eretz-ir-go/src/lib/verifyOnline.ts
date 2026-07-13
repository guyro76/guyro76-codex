/**
 * אימות אונליין של תשובות שאינן במאגר — מול מקורות פתוחים ומורשים בלבד:
 * ויקיפדיה העברית (חיפוש ערכים) ו-Wikidata. ללא מפתחות, ללא עלות,
 * והתשובה של הילד לא נשלחת לשום שירות AI — רק שאילתת חיפוש ציבורית.
 *
 * תשובה נכנסת למאגר המקומי רק אחרי שנמצא לה ערך תואם.
 */

export interface OnlineVerification {
  found: boolean;
  title?: string;
  description?: string;
  source?: string; // URL של הערך
  imageUrl?: string;
  imageAttribution?: string;
}

const WIKI_API = 'https://he.wikipedia.org/w/api.php';

function wikiUrl(params: Record<string, string>): string {
  const q = new URLSearchParams({ format: 'json', origin: '*', ...params });
  return `${WIKI_API}?${q.toString()}`;
}

/** חיפוש ערך בוויקיפדיה העברית + תקציר + תמונה ראשית (אם קיימת) */
export async function verifyOnWikipedia(term: string, signal?: AbortSignal): Promise<OnlineVerification> {
  try {
    const searchRes = await fetch(
      wikiUrl({ action: 'query', list: 'search', srsearch: term, srlimit: '3', srprop: '' }),
      { signal }
    );
    if (!searchRes.ok) return { found: false };
    const searchData = (await searchRes.json()) as {
      query?: { search?: { title: string }[] };
    };
    const hits = searchData.query?.search ?? [];
    // דורשים התאמה קרובה של הכותרת, לא סתם אזכור בטקסט
    const normalized = term.replace(/\s+/g, ' ').trim();
    const hit = hits.find((h) => titleMatches(h.title, normalized));
    if (!hit) return { found: false };

    const pageRes = await fetch(
      wikiUrl({
        action: 'query',
        prop: 'extracts|pageimages|info',
        titles: hit.title,
        exintro: '1',
        explaintext: '1',
        exsentences: '2',
        piprop: 'thumbnail',
        pithumbsize: '400',
        inprop: 'url'
      }),
      { signal }
    );
    if (!pageRes.ok) return { found: true, title: hit.title };
    const pageData = (await pageRes.json()) as {
      query?: { pages?: Record<string, { title: string; extract?: string; fullurl?: string; thumbnail?: { source: string } }> };
    };
    const page = Object.values(pageData.query?.pages ?? {})[0];
    return {
      found: true,
      title: page?.title ?? hit.title,
      description: page?.extract,
      source: page?.fullurl ?? `https://he.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
      imageUrl: page?.thumbnail?.source,
      imageAttribution: page?.thumbnail ? 'התמונה מוויקיפדיה/ויקישיתוף — ראו רישיון בעמוד הערך' : undefined
    };
  } catch {
    return { found: false }; // Offline או שגיאת רשת — לא מאשרים ולא פוסלים
  }
}

function titleMatches(title: string, term: string): boolean {
  const t = title.replace(/\s*\(.*\)\s*$/, '').trim(); // "פריז (עיר)" -> "פריז"
  if (t === term) return true;
  // מרחק עריכה קטן יחסית לאורך
  const len = Math.max(t.length, term.length);
  let dist = 0;
  if (t.includes(term) || term.includes(t)) dist = Math.abs(t.length - term.length);
  else return false;
  return dist <= Math.max(1, Math.floor(len * 0.25));
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? false : navigator.onLine;
}
