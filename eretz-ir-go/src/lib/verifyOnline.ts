/**
 * אימות אונליין של תשובות שאינן במאגר — מול מקורות פתוחים ומורשים בלבד:
 * ויקיפדיה העברית (חיפוש ערכים) ו-Wikidata. ללא מפתחות, ללא עלות,
 * והתשובה של הילד לא נשלחת לשום שירות AI — רק שאילתת חיפוש ציבורית.
 *
 * תשובה נכנסת למאגר המקומי רק אחרי שנמצא לה ערך תואם.
 */

import type { ImageCandidate } from './imageVerify';

/** מועמד לתמונה, עם הקישור לעמוד המקור לצורך הקרדיט */
export type ImageCandidateWithSource = ImageCandidate & { pageUrl?: string };

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

/**
 * שליפת מועמדים לתמונה, עם כל הראיות שנדרשות כדי לאמת שהם הערך הנכון:
 * תיאור קצר, פתיח, קטגוריות הערך וסימון דף פירושונים.
 * האימות עצמו נעשה ב-`imageVerify.ts` — כאן רק אוספים את העובדות.
 *
 * מחפשים גם לפי המילה לבדה וגם עם רמז הקטגוריה, כדי שערך שגוי
 * ("כרוב" היצור המיתולוגי) לא יסתיר את הערך הנכון ("כרוב" הירק).
 */
export async function fetchImageCandidates(
  term: string,
  categoryHint?: string,
  signal?: AbortSignal
): Promise<ImageCandidateWithSource[]> {
  try {
    const queries = categoryHint ? [term, `${term} ${categoryHint}`] : [term];
    const titles = new Set<string>();
    for (const q of queries) {
      const res = await fetch(wikiUrl({ action: 'query', list: 'search', srsearch: q, srlimit: '4', srprop: '' }), {
        signal
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { query?: { search?: { title: string }[] } };
      for (const hit of data.query?.search ?? []) titles.add(hit.title);
    }
    if (titles.size === 0) return [];

    const res = await fetch(
      wikiUrl({
        action: 'query',
        prop: 'extracts|pageimages|info|categories|pageprops',
        titles: [...titles].slice(0, 6).join('|'),
        exintro: '1',
        explaintext: '1',
        exsentences: '2',
        piprop: 'thumbnail',
        pithumbsize: '400',
        cllimit: '20',
        inprop: 'url'
      }),
      { signal }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            title: string;
            extract?: string;
            fullurl?: string;
            thumbnail?: { source: string };
            categories?: { title: string }[];
            pageprops?: { disambiguation?: string; 'wikibase-shortdesc'?: string };
          }
        >;
      };
    };
    return Object.values(data.query?.pages ?? {}).map((page) => ({
      title: page.title,
      description: page.pageprops?.['wikibase-shortdesc'],
      extract: page.extract,
      wikiCategories: (page.categories ?? []).map((c) => c.title.replace(/^קטגוריה:/, '')),
      imageUrl: page.thumbnail?.source,
      isDisambiguation: page.pageprops?.disambiguation !== undefined,
      pageUrl: page.fullurl
    }));
  } catch {
    return []; // Offline או שגיאת רשת — פשוט אין תמונה
  }
}
