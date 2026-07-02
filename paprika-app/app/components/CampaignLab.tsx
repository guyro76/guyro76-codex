'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ScanSearch } from 'lucide-react';
import { analyzeCampaignRows, parseCampaignCsv } from '../../lib/campaign-analyzer';
import type { AnalysisSummary, ImportPreview } from '../../lib/campaign-types';

export default function CampaignLab() {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [message, setMessage] = useState('');

  function runAnalysis(value = text) {
    try {
      const parsed = parseCampaignCsv(value);
      const result = analyzeCampaignRows(parsed.rows, parsed.headers);
      setPreview(parsed);
      setAnalysis(result);
      setMessage(`נותחו ${parsed.rows.length} שורות ונוצרו ${result.recommendations.length} המלצות.`);
    } catch (error) {
      setPreview(null);
      setAnalysis(null);
      setMessage(error instanceof Error ? error.message : 'לא ניתן לנתח את הנתונים.');
    }
  }

  return <div className="list">
    <section className="hero">
      <h3>מעבדת בדיקת קמפיינים</h3>
      <p>הדבק דוח CSV או טבלה מ-Google Ads או Meta Ads. פפריקה תזהה את הפלטפורמה, תחשב מדדים ותציג המלצות ללא שינוי אוטומטי בקמפיין.</p>
    </section>

    <div className="card">
      <h3>הדבקת נתוני קמפיין</h3>
      <p>אפשר להדביק CSV, TSV או טבלה שהועתקה מ-Google Sheets.</p>
      <textarea
        className="input"
        style={{ width: '100%', minHeight: 190, direction: 'ltr', textAlign: 'left', fontFamily: 'monospace' }}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Campaign,Cost,Impressions,Clicks,Conversions,Conversion value"
      />
      <button className="btn primary" style={{ marginTop: 12 }} onClick={() => runAnalysis()}>
        <ScanSearch size={17}/> ניתוח קמפיין
      </button>
    </div>

    {message && <div className="notice">{analysis ? <CheckCircle2 size={17}/> : <AlertTriangle size={17}/>} {message}</div>}

    {analysis && <>
      <div className="grid metrics">
        <Metric label="הוצאה" value={money(analysis.spend)}/>
        <Metric label="חשיפות" value={analysis.impressions.toLocaleString('he-IL')}/>
        <Metric label="קליקים" value={analysis.clicks.toLocaleString('he-IL')}/>
        <Metric label="המרות" value={analysis.conversions.toFixed(1)}/>
        <Metric label="CTR" value={`${analysis.ctr.toFixed(2)}%`}/>
        <Metric label="ROAS" value={analysis.roas.toFixed(2)}/>
      </div>

      {analysis.warnings.map((warning) => <div className="notice" key={warning}><AlertTriangle size={17}/>{warning}</div>)}

      <div className="toolbar"><h3>המלצות ({analysis.recommendations.length})</h3><span className="pill">אישור אנושי נדרש</span></div>
      <div className="grid two">
        {analysis.recommendations.map((item) => <article className="card" key={item.id}>
          <div className="toolbar"><span className={`pill ${item.severity === 'critical' || item.severity === 'high' ? 'bad' : ''}`}>{severityLabel[item.severity]}</span><span className="pill">ביטחון {item.confidence}%</span></div>
          <h3>{item.title}</h3>
          <p>{item.explanation}</p>
          <div className="practical"><b>ראיות</b><br/>{item.evidence.join(' · ')}</div>
          <div className="practical"><b>פעולה מומלצת</b><br/>{item.suggestedAction}</div>
          <div className="practical"><b>Rollback</b><br/>{item.rollbackPlan}</div>
        </article>)}
      </div>

      <div className="card table"><table><thead><tr><th>ישות</th><th>הוצאה</th><th>קליקים</th><th>המרות</th><th>CTR</th><th>ROAS</th></tr></thead><tbody>{preview?.rows.slice(0,100).map((row) => <tr key={row.sourceRow}><td>{row.searchTerm || row.keyword || row.ad || row.campaign || `שורה ${row.sourceRow}`}</td><td>{money(row.spend)}</td><td>{row.clicks}</td><td>{row.conversions}</td><td>{row.ctr.toFixed(2)}%</td><td>{row.roas.toFixed(2)}</td></tr>)}</tbody></table></div>
    </>}
  </div>;
}

const severityLabel = { critical: 'קריטי', high: 'גבוה', medium: 'בינוני', low: 'נמוך', info: 'מידע' } as const;
const money = (value: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);
function Metric({ label, value }: { label: string; value: string }) { return <div className="card"><small>{label}</small><h3>{value}</h3></div>; }
