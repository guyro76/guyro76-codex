'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Image as ImageIcon, Save, ScanSearch, Upload } from 'lucide-react';
import { analyzeCampaignRows, parseCampaignCsv } from '../../lib/campaign-analyzer';
import type { AnalysisSummary, ImportPreview } from '../../lib/campaign-types';
import { getSupabaseBrowserClient } from '../../lib/supabase';

export default function CampaignLab() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  function runAnalysis(value = text, name = 'pasted-report.csv') {
    try {
      const parsed = parseCampaignCsv(value);
      const result = analyzeCampaignRows(parsed.rows, parsed.headers);
      setPreview(parsed);
      setAnalysis(result);
      setFileName(name);
      setMessage(`נותחו ${parsed.rows.length} שורות ונוצרו ${result.recommendations.length} המלצות.`);
    } catch (error) {
      setPreview(null);
      setAnalysis(null);
      setMessage(error instanceof Error ? error.message : 'לא ניתן לנתח את הנתונים.');
    }
  }

  async function importReport(file?: File) {
    if (!file) return;
    if (!/\.(csv|tsv|txt)$/i.test(file.name)) {
      setMessage('יש לבחור קובץ CSV, TSV או TXT שיוצא ממערכת הפרסום.');
      return;
    }
    runAnalysis(await file.text(), file.name);
  }

  function importScreenshot(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('יש לבחור קובץ תמונה.');
      return;
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setMessage('הצילום נטען. הוא מתאים לבדיקת מודעות, מבנה והודעות שגיאה. לניתוח מספרי מלא מומלץ לצרף CSV.');
  }

  async function saveToCloud() {
    if (!supabase || !preview || !analysis) return setMessage('יש להתחבר ל-Supabase ולהשלים ניתוח לפני השמירה.');
    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) { setSaving(false); return setMessage('יש להתחבר למערכת לפני שמירה בענן.'); }

    const { data: importRecord, error: importError } = await supabase.from('data_imports').insert({
      user_id: user.id,
      platform: analysis.platform,
      source_type: 'csv',
      file_name: fileName,
      status: 'ready',
      row_count: analysis.rowCount,
      detected_columns: analysis.detectedColumns,
      warnings: analysis.warnings,
      summary: { spend: analysis.spend, impressions: analysis.impressions, clicks: analysis.clicks, conversions: analysis.conversions, conversion_value: analysis.conversionValue, ctr: analysis.ctr, cpc: analysis.cpc, cpm: analysis.cpm, conversion_rate: analysis.conversionRate, roas: analysis.roas },
    }).select('id').single();

    if (importError || !importRecord) { setSaving(false); return setMessage(importError?.message || 'שמירת הייבוא נכשלה.'); }

    const rows = preview.rows.map((row) => ({
      import_id: importRecord.id, user_id: user.id, platform: row.platform, report_date: row.date || null,
      campaign_name: row.campaign || null, ad_group_name: row.adGroup || null, ad_name: row.ad || null,
      keyword: row.keyword || null, search_term: row.searchTerm || null, spend: row.spend,
      impressions: row.impressions, clicks: row.clicks, conversions: row.conversions,
      conversion_value: row.conversionValue, ctr: row.ctr, cpc: row.cpc, cpm: row.cpm,
      conversion_rate: row.conversionRate, roas: row.roas, frequency: row.frequency, raw: row.raw,
    }));
    for (let index = 0; index < rows.length; index += 250) {
      const { error } = await supabase.from('campaign_rows').insert(rows.slice(index, index + 250));
      if (error) { setSaving(false); return setMessage(`הייבוא נוצר, אך שמירת השורות נכשלה: ${error.message}`); }
    }

    if (analysis.recommendations.length) {
      const recommendationRows = analysis.recommendations.map((item) => ({
        user_id: user.id, import_id: importRecord.id, provider: item.platform, severity: item.severity,
        category: item.category, entity_name: item.entityName || null, title: item.title,
        explanation: item.explanation, evidence: item.evidence, expected_impact: item.expectedImpact,
        confidence: item.confidence, suggested_action: item.suggestedAction, rollback_plan: item.rollbackPlan,
        status: 'pending', requires_approval: true,
      }));
      const { error } = await supabase.from('recommendations').insert(recommendationRows);
      if (error) { setSaving(false); return setMessage(`המדדים נשמרו, אך ההמלצות לא נשמרו: ${error.message}`); }
    }
    setSaving(false);
    setMessage('הניתוח, המדדים וההמלצות נשמרו ב-Supabase.');
  }

  return <div className="list">
    <section className="hero"><h3>מעבדת בדיקת קמפיינים</h3><p>העלה דוח, הדבק טבלה או צרף צילום מסך. פפריקה תזהה את הפלטפורמה, תחשב מדדים ותציג המלצות ללא שינוי אוטומטי בקמפיין.</p></section>
    <div className="grid two">
      <label className="card" style={{ cursor: 'pointer', textAlign: 'center' }}><Upload size={32}/><h3>העלאת CSV או TSV</h3><p>Campaigns, Ads, Keywords או Search Terms</p><input hidden type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" onChange={(event) => importReport(event.target.files?.[0])}/></label>
      <label className="card" style={{ cursor: 'pointer', textAlign: 'center' }}><ImageIcon size={32}/><h3>העלאת צילום מסך</h3><p>לבדיקת מודעות, מבנה, Tracking והודעות שגיאה</p><input hidden type="file" accept="image/*" onChange={(event) => importScreenshot(event.target.files?.[0])}/></label>
    </div>
    <div className="card"><h3><FileSpreadsheet size={18}/> הדבקת נתוני קמפיין</h3><p>אפשר להדביק CSV, TSV או טבלה שהועתקה מ-Google Sheets.</p><textarea className="input" style={{ width: '100%', minHeight: 190, direction: 'ltr', textAlign: 'left', fontFamily: 'monospace' }} value={text} onChange={(event) => setText(event.target.value)} placeholder="Campaign,Cost,Impressions,Clicks,Conversions,Conversion value"/><button className="btn primary" style={{ marginTop: 12 }} onClick={() => runAnalysis()}><ScanSearch size={17}/> ניתוח קמפיין</button></div>
    {message && <div className="notice">{analysis ? <CheckCircle2 size={17}/> : <AlertTriangle size={17}/>} {message}</div>}
    {fileName && <div className="notice">קובץ פעיל: {fileName}</div>}
    {imageUrl && <div className="card"><img src={imageUrl} alt="צילום מסך שהועלה" style={{ display: 'block', maxWidth: '100%', maxHeight: 480, margin: 'auto', borderRadius: 16 }}/></div>}
    {analysis && <><div className="grid metrics"><Metric label="הוצאה" value={money(analysis.spend)}/><Metric label="חשיפות" value={analysis.impressions.toLocaleString('he-IL')}/><Metric label="קליקים" value={analysis.clicks.toLocaleString('he-IL')}/><Metric label="המרות" value={analysis.conversions.toFixed(1)}/><Metric label="CTR" value={`${analysis.ctr.toFixed(2)}%`}/><Metric label="ROAS" value={analysis.roas.toFixed(2)}/></div>{analysis.warnings.map((warning) => <div className="notice" key={warning}><AlertTriangle size={17}/>{warning}</div>)}<div className="toolbar"><h3>המלצות ({analysis.recommendations.length})</h3><button className="btn primary" disabled={saving} onClick={saveToCloud}><Save size={16}/>{saving ? 'שומר...' : 'שמירה ל-Supabase'}</button></div><div className="grid two">{analysis.recommendations.map((item) => <article className="card" key={item.id}><div className="toolbar"><span className={`pill ${item.severity === 'critical' || item.severity === 'high' ? 'bad' : ''}`}>{severityLabel[item.severity]}</span><span className="pill">ביטחון {item.confidence}%</span></div><h3>{item.title}</h3><p>{item.explanation}</p><div className="practical"><b>ראיות</b><br/>{item.evidence.join(' · ')}</div><div className="practical"><b>פעולה מומלצת</b><br/>{item.suggestedAction}</div><div className="practical"><b>Rollback</b><br/>{item.rollbackPlan}</div></article>)}</div><div className="card table"><table><thead><tr><th>ישות</th><th>הוצאה</th><th>קליקים</th><th>המרות</th><th>CTR</th><th>ROAS</th></tr></thead><tbody>{preview?.rows.slice(0,100).map((row) => <tr key={row.sourceRow}><td>{row.searchTerm || row.keyword || row.ad || row.campaign || `שורה ${row.sourceRow}`}</td><td>{money(row.spend)}</td><td>{row.clicks}</td><td>{row.conversions}</td><td>{row.ctr.toFixed(2)}%</td><td>{row.roas.toFixed(2)}</td></tr>)}</tbody></table></div></>}
  </div>;
}

const severityLabel = { critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך', info: 'מידע' } as const;
const money = (value: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);
function Metric({ label, value }: { label: string; value: string }) { return <div className="card"><small>{label}</small><h3>{value}</h3></div>; }
