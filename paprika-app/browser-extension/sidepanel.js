let latestSnapshot = null;

const byId = (id) => document.getElementById(id);
const providerLabel = { google_ads: 'Google Ads', meta_ads: 'Meta Ads', unknown: 'לא זוהה' };

async function activeTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

function summarize(snapshot) {
  const rowCount = snapshot.tables.reduce((sum, table) => sum + table.rows.length, 0);
  byId('provider').textContent = providerLabel[snapshot.provider] || 'לא זוהה';
  byId('pageTitle').textContent = snapshot.title || snapshot.url;
  byId('tableCount').textContent = String(snapshot.tables.length);
  byId('rowCount').textContent = String(rowCount);
  byId('headingCount').textContent = String(snapshot.headings.length);

  if (!snapshot.tables.length) {
    byId('preview').textContent = 'לא נמצאה טבלה גלויה. נסה לעבור למסך Campaigns, Ads, Keywords או Search Terms ולסרוק שוב.';
    return;
  }

  byId('preview').innerHTML = snapshot.tables.slice(0, 6).map((table, index) => {
    const firstRows = table.rows.slice(0, 3).map((row) => row.join(' | ')).join('\n');
    return `<div class="table-card"><b>טבלה ${index + 1}: ${table.rows.length} שורות</b><div class="preview">${escapeHtml(table.headers.join(' | '))}\n${escapeHtml(firstRows)}</div></div>`;
  }).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function toTsv(snapshot) {
  return snapshot.tables.map((table, index) => {
    const title = `TABLE ${index + 1}`;
    const rows = [table.headers, ...table.rows].map((row) => row.map((cell) => String(cell).replace(/\t/g, ' ')).join('\t'));
    return [title, ...rows].join('\n');
  }).join('\n\n');
}

async function capture() {
  const message = byId('message');
  message.className = 'status';
  message.textContent = 'סורק טבלאות גלויות...';
  try {
    const tab = await activeTab();
    if (!tab?.id) throw new Error('לא נמצאה לשונית פעילה.');
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'PAPRIKA_CAPTURE' });
    if (!response?.ok) throw new Error(response?.error || 'הסריקה נכשלה.');
    latestSnapshot = response.snapshot;
    summarize(latestSnapshot);
    byId('download').disabled = false;
    byId('copyCsv').disabled = !latestSnapshot.tables.length;
    await chrome.storage.local.set({ paprikaLatestSnapshot: latestSnapshot });
    message.className = 'status success';
    message.textContent = 'ה-Snapshot נשמר מקומית בתוסף ומוכן לייצוא.';
  } catch (error) {
    latestSnapshot = null;
    message.className = 'status danger';
    message.textContent = `${error.message || error} ודא שאתה נמצא ב-Google Ads או Meta Ads Manager ורענן את הדף לאחר התקנת התוסף.`;
  }
}

async function downloadJson() {
  if (!latestSnapshot) return;
  const blob = new Blob([JSON.stringify(latestSnapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const provider = latestSnapshot.provider || 'ads';
  await chrome.downloads.download({ url, filename: `paprika-${provider}-${Date.now()}.json`, saveAs: true });
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function copyTsv() {
  if (!latestSnapshot) return;
  await navigator.clipboard.writeText(toTsv(latestSnapshot));
  byId('message').className = 'status success';
  byId('message').textContent = 'הטבלה הועתקה. אפשר להדביק אותה במסך בדיקת הקמפיינים בפפריקה.';
}

byId('capture').addEventListener('click', capture);
byId('download').addEventListener('click', downloadJson);
byId('copyCsv').addEventListener('click', copyTsv);

chrome.storage.local.get('paprikaLatestSnapshot').then(({ paprikaLatestSnapshot }) => {
  if (!paprikaLatestSnapshot) return;
  latestSnapshot = paprikaLatestSnapshot;
  summarize(latestSnapshot);
  byId('download').disabled = false;
  byId('copyCsv').disabled = !latestSnapshot.tables.length;
});
