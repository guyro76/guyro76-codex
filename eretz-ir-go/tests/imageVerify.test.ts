import { describe, expect, it } from 'vitest';
import { isBadImageKind, matchesCategory, splitTitle, verifyImageCandidate } from '../src/lib/imageVerify';

const PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/b/Cabbage.jpg/400px-Cabbage.jpg';

describe('התקלות שדווחו מהמשחק', () => {
  it('"כרוב" בצומח: הערך על היצור המיתולוגי נדחה', () => {
    const res = verifyImageCandidate('כרוב', 'plant', {
      title: 'כרוב',
      description: 'יצור מיתולוגי מכונף',
      extract: 'כְּרוּב הוא יצור מיתולוגי המוזכר במקרא, מסוג המלאכים.',
      imageUrl: 'https://upload.wikimedia.org/.../Cherub_angel.jpg'
    });
    expect(res).toEqual({ ok: false, reason: 'category-mismatch' });
  });

  it('"כרוב" בצומח: הערך על הירק מתקבל', () => {
    const res = verifyImageCandidate('כרוב', 'plant', {
      title: 'כרוב',
      description: 'מין של צמח',
      extract: 'כרוב הוא ירק ממשפחת המצליבים.',
      imageUrl: PHOTO
    });
    expect(res).toEqual({ ok: true });
  });

  it('"כלנית" כשם של בת: אף פעם לא מוצגת תמונה', () => {
    const res = verifyImageCandidate('כלנית', 'girlname', {
      title: 'כלנית (מושב)',
      description: 'מושב בגליל העליון',
      imageUrl: 'https://upload.wikimedia.org/.../Kalanit_location_map.svg.png'
    });
    expect(res).toEqual({ ok: false, reason: 'name-category' });
  });

  it('"כלנית" בצומח: המושב נדחה — מפה אינה תמונה של פרח', () => {
    const res = verifyImageCandidate('כלנית', 'plant', {
      title: 'כלנית (מושב)',
      description: 'מושב בגליל העליון',
      imageUrl: 'https://upload.wikimedia.org/.../Kalanit_location_map.svg.png'
    });
    expect(res).toEqual({ ok: false, reason: 'bad-image-kind' });
  });

  it('"כלנית" בצומח: הפרח עצמו מתקבל', () => {
    const res = verifyImageCandidate('כלנית', 'plant', {
      title: 'כלנית',
      description: 'סוג של צמח ממשפחת הנוריתיים',
      extract: 'כלנית היא סוג של צמח פרחים.',
      imageUrl: 'https://upload.wikimedia.org/.../Anemone_coronaria.jpg'
    });
    expect(res).toEqual({ ok: true });
  });
});

describe('שערי האימות', () => {
  it('דוחה כשאין תמונה בכלל', () => {
    expect(verifyImageCandidate('צרפת', 'country', { title: 'צרפת' })).toEqual({
      ok: false,
      reason: 'no-image'
    });
  });

  it('דוחה דף פירושונים', () => {
    expect(
      verifyImageCandidate('עמק', 'inanimate', { title: 'עמק', imageUrl: PHOTO, isDisambiguation: true })
    ).toEqual({ ok: false, reason: 'disambiguation' });
  });

  it('דורש כותרת זהה — לא "דומה"', () => {
    const res = verifyImageCandidate('גמל', 'animal', {
      title: 'גמליאל',
      description: 'בעל חיים',
      imageUrl: PHOTO
    });
    expect(res).toEqual({ ok: false, reason: 'title-mismatch' });
  });

  it('מקבל כותרת עם סוגריים כשההסבר תואם לקטגוריה', () => {
    const res = verifyImageCandidate('צבר', 'plant', {
      title: 'צבר (צמח)',
      extract: 'הצבר הוא צמח ממשפחת הקקטוסיים.',
      imageUrl: PHOTO
    });
    expect(res).toEqual({ ok: true });
  });

  it('מבדיל חי מצומח — סימנים בלעדיים לכל קטגוריה', () => {
    const deer = { title: 'צבי', extract: 'הצבי הוא יונק ממשפחת האיילים.', imageUrl: PHOTO };
    expect(verifyImageCandidate('צבי', 'animal', deer)).toEqual({ ok: true });
    expect(verifyImageCandidate('צבי', 'plant', deer)).toEqual({ ok: false, reason: 'category-mismatch' });
  });

  it('לא חוסם קטגוריה מותאמת אישית שאין לה סימנים', () => {
    expect(
      verifyImageCandidate('פוקימון', 'custom-123', { title: 'פוקימון', imageUrl: PHOTO })
    ).toEqual({ ok: true });
  });
});

describe('זיהוי תמונות שאינן צילום', () => {
  it.each([
    'https://x/Israel_location_map.svg.png',
    'https://x/Flag_of_France.svg.png',
    'https://x/Coat_of_arms_of_Spain.png',
    'https://x/Logo_something.png',
    'https://x/מפה_של_הגליל.png'
  ])('דוחה %s', (url) => {
    expect(isBadImageKind(url)).toBe(true);
  });

  it('מקבל צילום רגיל', () => {
    expect(isBadImageKind(PHOTO)).toBe(false);
    expect(isBadImageKind('https://x/Anemone_coronaria_flower.jpg')).toBe(false);
  });
});

describe('פירוק כותרת', () => {
  it('מפריד את ההבהרה שבסוגריים', () => {
    expect(splitTitle('כלנית (מושב)')).toEqual({ base: 'כלנית', qualifier: 'מושב' });
    expect(splitTitle('כלנית')).toEqual({ base: 'כלנית' });
  });
});

describe('התאמת נושא', () => {
  it('מזהה מדינה, עיר ומקצוע', () => {
    expect(matchesCategory('מדינה באירופה', 'country')).toBe(true);
    expect(matchesCategory('עיר בצרפת', 'city')).toBe(true);
    expect(matchesCategory('מקצוע בתחום הרפואה', 'profession')).toBe(true);
    expect(matchesCategory('מין של צמח', 'country')).toBe(false);
  });
});
