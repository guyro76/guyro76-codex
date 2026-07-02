import type { AdsPlatform, AnalysisSummary, CampaignRow, ImportPreview, Recommendation, Severity } from './campaign-types';

const aliases: Record<string, string[]> = {
  date: ['date', 'day', 'תאריך'],
  account: ['account', 'account name', 'customer', 'שם חשבון'],
  campaign: ['campaign', 'campaign name', 'שם קמפיין'],
  adGroup: ['ad group', 'ad set', 'adset', 'קבוצת מודעות'],
  ad: ['ad', 'ad name', 'creative', 'מודעה'],
  keyword: ['keyword', 'keyword text', 'מילת מפתח'],
  searchTerm: ['search term', 'search terms', 'query', 'search query', 'מונח חיפוש'],
  status: ['status', 'campaign status', 'סטטוס'],
  currency: ['currency', 'currency code', 'מטבע'],
  spend: ['cost', 'spend', 'amount spent', 'עלות', 'הוצאה'],
  impressions: ['impressions', 'חשיפות'],
  clicks: ['clicks', 'link clicks', 'קליקים', 'הקלקות'],
  conversions: ['conversions', 'results', 'purchases', 'leads', 'המרות', 'תוצאות'],
  conversionValue: ['conversion value', 'all conv. value', 'purchase conversion value', 'revenue', 'ערך המרה', 'הכנסה'],
  ctr: ['ctr', 'link ctr', 'click-through rate', 'שיעור הקלקה'],
  cpc: ['avg. cpc', 'cpc', 'cost per click', 'עלות לקליק'],
  cpm: ['avg. cpm', 'cpm', 'cost per 1,000 impressions', 'עלות לאלף חשיפות'],
  conversionRate: ['conversion rate', 'conv. rate', 'cvr', 'שיעור המרה'],
  roas: ['roas', 'purchase roas', 'conv. value / cost', 'החזר על הוצאה'],
  frequency: ['frequency', 'תדירות'],
};

function cleanHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[()]/g, '');
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const normalized = value
    .replace(/[₪$€£,%]/g, '')
    .replace(/\s/g, '')
    .replace(/,/g, '')
    .replace(/\(([^)]+)\)/, '-$1');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/).find(Boolean) || '';
  const candidates = [',', '\t', ';'];
  return candidates.sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
}

function findColumn(headers: string[], key: string) {
  const candidates = aliases[key] || [];
  return headers.findIndex((header) => candidates.includes(cleanHeader(header)));
}

function valueAt(values: string[], index: number) {
  return index >= 0 ? values[index]?.trim() || '' : '';
}

function detectPlatform(headers: string[], rawText: string): AdsPlatform {
  const normalized = `${headers.join(' ')} ${rawText.slice(0, 2000)}`.toLowerCase();
  if (/search term|keyword|quality score|impression share|google ads/.test(normalized)) return 'google_ads';
  if (/ad set|frequency|amount spent|purchase roas|meta ads|facebook/.test(normalized)) return 'meta_ads';
  return 'unknown';
}

function makeId(prefix: string, row: CampaignRow, index: number) {
  const basis = `${prefix}-${row.campaign || row.searchTerm || row.ad || index}`;
  let hash = 0;
  for (let i = 0; i < basis.length; i += 1) hash = ((hash << 5) - hash + basis.charCodeAt(i)) | 0;
  return `${prefix}-${Math.abs(hash)}`;
}

export function parseCampaignCsv(text: string): ImportPreview {
  const delimiter = detectDelimiter(text);
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error('הקובץ אינו כולל כותרות ושורות נתונים.');

  const headers = splitCsvLine(lines[0], delimiter);
  const indexes = Object.fromEntries(Object.keys(aliases).map((key) => [key, findColumn(headers, key)]));
  const platform = detectPlatform(headers, text);
  const warnings: string[] = [];
  if (indexes.spend < 0) warnings.push('לא זוהתה עמודת עלות או Spend.');
  if (indexes.impressions < 0) warnings.push('לא זוהתה עמודת חשיפות.');
  if (indexes.conversions < 0) warnings.push('לא זוהתה עמודת המרות או Results.');
  if (platform === 'unknown') warnings.push('לא ניתן לזהות בוודאות אם הדוח הגיע מ-Google Ads או Meta Ads.');

  const rows: CampaignRow[] = lines.slice(1).map((line, offset) => {
    const values = splitCsvLine(line, delimiter);
    const raw = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    const impressions = parseNumber(valueAt(values, indexes.impressions));
    const clicks = parseNumber(valueAt(values, indexes.clicks));
    const spend = parseNumber(valueAt(values, indexes.spend));
    const conversions = parseNumber(valueAt(values, indexes.conversions));
    const conversionValue = parseNumber(valueAt(values, indexes.conversionValue));
    const calculatedCtr = impressions ? (clicks / impressions) * 100 : 0;
    const calculatedCpc = clicks ? spend / clicks : 0;
    const calculatedCpm = impressions ? (spend / impressions) * 1000 : 0;
    const calculatedCvr = clicks ? (conversions / clicks) * 100 : 0;
    const calculatedRoas = spend ? conversionValue / spend : 0;
    return {
      sourceRow: offset + 2,
      platform,
      date: valueAt(values, indexes.date),
      account: valueAt(values, indexes.account),
      campaign: valueAt(values, indexes.campaign),
      adGroup: valueAt(values, indexes.adGroup),
      ad: valueAt(values, indexes.ad),
      keyword: valueAt(values, indexes.keyword),
      searchTerm: valueAt(values, indexes.searchTerm),
      status: valueAt(values, indexes.status),
      currency: valueAt(values, indexes.currency),
      spend,
      impressions,
      clicks,
      conversions,
      conversionValue,
      ctr: parseNumber(valueAt(values, indexes.ctr)) || calculatedCtr,
      cpc: parseNumber(valueAt(values, indexes.cpc)) || calculatedCpc,
      cpm: parseNumber(valueAt(values, indexes.cpm)) || calculatedCpm,
      conversionRate: parseNumber(valueAt(values, indexes.conversionRate)) || calculatedCvr,
      roas: parseNumber(valueAt(values, indexes.roas)) || calculatedRoas,
      frequency: parseNumber(valueAt(values, indexes.frequency)),
      raw,
    };
  }).filter((row) => Object.values(row.raw).some(Boolean));

  return { headers, rows, platform, warnings };
}

function recommendation(
  row: CampaignRow,
  index: number,
  severity: Severity,
  category: Recommendation['category'],
  title: string,
  explanation: string,
  evidence: string[],
  expectedImpact: string,
  confidence: number,
  suggestedAction: string,
  rollbackPlan: string,
): Recommendation {
  return {
    id: makeId(category, row, index),
    platform: row.platform,
    severity,
    category,
    title,
    explanation,
    evidence,
    expectedImpact,
    confidence,
    requiresApproval: true,
    rollbackPlan,
    entityName: row.searchTerm || row.keyword || row.ad || row.campaign || row.adGroup,
    suggestedAction,
  };
}

export function analyzeCampaignRows(rows: CampaignRow[], detectedColumns: string[] = []): AnalysisSummary {
  if (!rows.length) throw new Error('לא נמצאו שורות קמפיין לניתוח.');
  const totals = rows.reduce((acc, row) => ({
    spend: acc.spend + row.spend,
    impressions: acc.impressions + row.impressions,
    clicks: acc.clicks + row.clicks,
    conversions: acc.conversions + row.conversions,
    conversionValue: acc.conversionValue + row.conversionValue,
  }), { spend: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0 });

  const platform = rows.find((row) => row.platform !== 'unknown')?.platform || 'unknown';
  const avgCtr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCpc = totals.clicks ? totals.spend / totals.clicks : 0;
  const avgCpm = totals.impressions ? (totals.spend / totals.impressions) * 1000 : 0;
  const avgCvr = totals.clicks ? (totals.conversions / totals.clicks) * 100 : 0;
  const avgRoas = totals.spend ? totals.conversionValue / totals.spend : 0;
  const recommendations: Recommendation[] = [];

  rows.forEach((row, index) => {
    const entity = row.searchTerm || row.keyword || row.ad || row.campaign || `שורה ${row.sourceRow}`;
    if (row.spend >= 300 && row.clicks >= 25 && row.conversions === 0) {
      recommendations.push(recommendation(
        row, index, row.spend >= 1000 ? 'critical' : 'high', 'tracking',
        `אין המרות למרות הוצאה משמעותית ב-${entity}`,
        'הנתונים מצביעים על תנועה בתשלום ללא המרה. ייתכן שמדובר בבעיית Tracking, התאמה חלשה לכוונה או דף נחיתה שאינו ממיר.',
        [`הוצאה: ${row.spend.toFixed(0)}`, `קליקים: ${row.clicks}`, 'המרות: 0'],
        'מניעת המשך בזבוז ובידוד מקור הכשל', 92,
        'עצור הגדלת תקציב, אמת אירועי המרה ובדוק את דף הנחיתה לפני שינוי בידינג.',
        'אם לאחר תיקון המדידה מתקבלות המרות איכותיות, החזר את התקציב בהדרגה של 10%-15%.',
      ));
    }
    if (row.searchTerm && row.spend >= 100 && row.conversions === 0) {
      recommendations.push(recommendation(
        row, index, 'high', 'search_terms',
        `מועמד למילת שלילה: ${row.searchTerm}`,
        'מונח החיפוש צרך תקציב ללא המרה. יש לבדוק את כוונת החיפוש לפני חסימה.',
        [`עלות: ${row.spend.toFixed(0)}`, `קליקים: ${row.clicks}`, 'המרות: 0'],
        'חיסכון בהוצאה לא רלוונטית', 86,
        `בדוק את המונח בהקשר העסקי והוסף כמילת שלילה רק לאחר אישור אנושי.`,
        'הסר את מילת השלילה אם נפח חיפושים איכותי נעלם או אם מתקבלות המרות מסייעות.',
      ));
    }
    if (row.platform === 'meta_ads' && row.frequency >= 4 && row.ctr > 0 && row.ctr < Math.max(0.8, avgCtr * 0.75)) {
      recommendations.push(recommendation(
        row, index, row.frequency >= 7 ? 'critical' : 'high', 'creative',
        `סימני שחיקת קריאייטיב ב-${entity}`,
        'תדירות גבוהה יחד עם CTR נמוך יחסית מרמזים שהקהל רואה את אותו מסר יותר מדי פעמים.',
        [`Frequency: ${row.frequency.toFixed(2)}`, `CTR: ${row.ctr.toFixed(2)}%`, `CTR ממוצע: ${avgCtr.toFixed(2)}%`],
        'שיפור תגובת הקהל והפחתת CPM/CPC', 90,
        'הכן וריאציה עם Hook, זווית ופורמט חדשים. אל תסתפק בשינוי צבע בלבד.',
        'השאר את הקריאייטיב המקורי בקבוצת ביקורת והחזר אותו אם הגרסה החדשה אינה משפרת CTR או CPA.',
      ));
    }
    if (row.ctr > 0 && row.ctr < (row.platform === 'google_ads' ? 2 : 0.8) && row.impressions >= 1000) {
      recommendations.push(recommendation(
        row, index, 'medium', row.platform === 'google_ads' ? 'keywords' : 'creative',
        `CTR נמוך ב-${entity}`,
        'המודעה מקבלת חשיפות אך אינה מושכת מספיק קליקים ביחס לרף אבחוני בסיסי.',
        [`חשיפות: ${row.impressions}`, `CTR: ${row.ctr.toFixed(2)}%`],
        'שיפור רלוונטיות והגדלת נפח תנועה איכותי', 78,
        row.platform === 'google_ads'
          ? 'בדוק התאמה בין מילת החיפוש, הכותרת והצעת הערך. נסח וריאציות RSA ממוקדות יותר.'
          : 'בדוק את שלוש השניות הראשונות, ה-Hook, ההוכחה וה-CTA.',
        'מדוד מול קבוצת ביקורת והחזר את הנוסח הקודם אם CTR משתפר אך איכות ההמרות יורדת.',
      ));
    }
    if (row.roas > 0 && row.roas < 1.5 && row.spend >= 500) {
      recommendations.push(recommendation(
        row, index, 'high', 'budget',
        `ROAS נמוך ב-${entity}`,
        'החזר ההכנסה על ההוצאה נמוך, אך לפני קיצוץ יש לוודא שהערכים כוללים רווחיות, ביטולים ואיכות לידים.',
        [`הוצאה: ${row.spend.toFixed(0)}`, `ערך המרה: ${row.conversionValue.toFixed(0)}`, `ROAS: ${row.roas.toFixed(2)}`],
        'הפחתת הוצאה לא רווחית והעברת תקציב לנכסים טובים יותר', 84,
        'בדוק רווח גולמי ומקור אמת ב-CRM, ואז הפחת תקציב בהדרגה או העבר אותו לקמפיינים יעילים יותר.',
        'שמור צילום מצב של התקציב והחזר עד 15% בכל פעם אם נפח ההמרות נפגע מעבר לצפוי.',
      ));
    }
  });

  const unique = Array.from(new Map(recommendations.map((item) => [item.id, item])).values())
    .sort((a, b) => {
      const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return order[a.severity] - order[b.severity] || b.confidence - a.confidence;
    });

  const warnings: string[] = [];
  if (!totals.spend) warnings.push('לא נמצאה הוצאה כספית. ייתכן שהקובץ חסר עמודת Cost/Spend.');
  if (!totals.conversions) warnings.push('לא נמצאו המרות. יש לוודא Tracking וטווח תאריכים לפני החלטה.');
  if (!totals.conversionValue) warnings.push('לא נמצא ערך המרה, לכן ROAS אינו יכול לשמש כמדד מרכזי.');
  if (platform === 'unknown') warnings.push('הפלטפורמה לא זוהתה בוודאות.');

  return {
    platform,
    rowCount: rows.length,
    ...totals,
    ctr: avgCtr,
    cpc: avgCpc,
    cpm: avgCpm,
    conversionRate: avgCvr,
    roas: avgRoas,
    recommendations: unique,
    warnings,
    detectedColumns,
  };
}
