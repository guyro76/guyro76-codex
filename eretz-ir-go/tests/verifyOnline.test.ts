import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REQUEST_TIMEOUT_MS, fetchImageCandidates, verifyOnWikipedia } from '../src/lib/verifyOnline';

/**
 * הבדיקות האלה קיימות בגלל באג אמיתי: הקריאות לוויקיפדיה לא היו
 * חסומות בזמן, ולכן ברשת שבולעת בקשות הילד היה לוחץ "סיימתי" ונשאר
 * מול מסך תקוע — הבקשה פשוט לא חוזרת לעולם.
 */
const realFetch = globalThis.fetch;

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  vi.useRealTimers();
  globalThis.fetch = realFetch;
});

/** fetch שלעולם לא נענה, אבל מכבד ביטול — בדיוק כמו רשת תקועה */
function hangingFetch() {
  return vi.fn(
    (_url: string, init?: { signal?: AbortSignal }) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      })
  );
}

describe('אימות אונליין — לעולם לא נתקע', () => {
  it('בקשה תקועה נחתכת בזמן הקצוב ומחזירה "לא נמצא"', async () => {
    globalThis.fetch = hangingFetch() as unknown as typeof fetch;

    const promise = verifyOnWikipedia('כלנית');
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 50);

    await expect(promise).resolves.toEqual({ found: false });
  });

  it('גם שליפת מועמדים לתמונה נחתכת ולא תולה את מסך התוצאות', async () => {
    globalThis.fetch = hangingFetch() as unknown as typeof fetch;

    const promise = fetchImageCandidates('כרוב', 'ירק');
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 50);

    await expect(promise).resolves.toEqual([]);
  });

  it('שתי שאילתות החיפוש יוצאות במקביל — לא זו אחרי זו', async () => {
    const spy = hangingFetch();
    globalThis.fetch = spy as unknown as typeof fetch;

    const promise = fetchImageCandidates('כרוב', 'ירק');
    // עוד לפני שחלף הזמן הקצוב, שתי הבקשות כבר צריכות להיות באוויר
    await vi.advanceTimersByTimeAsync(10);
    expect(spy).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 50);
    await expect(promise).resolves.toEqual([]);
  });

  it('הבקשה באמת מבוטלת — לא רק ננטשת ברקע', async () => {
    const spy = hangingFetch();
    globalThis.fetch = spy as unknown as typeof fetch;

    const promise = verifyOnWikipedia('בדיקה');
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 50);
    await promise;

    const signal = spy.mock.calls[0][1]?.signal;
    expect(signal?.aborted).toBe(true);
  });

  it('ביטול חיצוני עוצר מיד, בלי לחכות לזמן הקצוב', async () => {
    globalThis.fetch = hangingFetch() as unknown as typeof fetch;

    const controller = new AbortController();
    const promise = verifyOnWikipedia('בדיקה', controller.signal);
    controller.abort();

    await expect(promise).resolves.toEqual({ found: false });
  });

  it('שגיאת רשת לא מאשרת ולא פוסלת — התשובה נשארת בבדיקה', async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
    await expect(verifyOnWikipedia('כלנית')).resolves.toEqual({ found: false });
  });

  it('תשובת שגיאה מהשרת (500) לא מפילה כלום', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response)
    ) as unknown as typeof fetch;
    await expect(verifyOnWikipedia('כלנית')).resolves.toEqual({ found: false });
    await expect(fetchImageCandidates('כלנית')).resolves.toEqual([]);
  });
});
