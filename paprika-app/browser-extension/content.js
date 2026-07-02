function provider() {
  if (location.hostname === 'ads.google.com') return 'google_ads';
  if (location.hostname.includes('facebook.com')) return 'meta_ads';
  return 'unknown';
}

function text(node) {
  return String(node?.innerText || node?.textContent || '').replace(/\s+/g, ' ').trim();
}

function visible(node) {
  if (!(node instanceof HTMLElement)) return false;
  const rect = node.getBoundingClientRect();
  const style = getComputedStyle(node);
  return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
}

function htmlTable(table, index) {
  const rawRows = Array.from(table.querySelectorAll('tr')).filter(visible).slice(0, 250);
  const rows = rawRows.map((row) => Array.from(row.querySelectorAll('th,td')).filter(visible).map(text));
  return { id: `table-${index + 1}`, source: 'html', headers: rows[0] || [], rows: rows.slice(1) };
}

function ariaGrid(grid, index) {
  const rawRows = Array.from(grid.querySelectorAll('[role="row"]')).filter(visible).slice(0, 250);
  const rows = rawRows.map((row) => Array.from(row.querySelectorAll('[role="columnheader"],[role="gridcell"],[role="cell"]')).filter(visible).map(text));
  return { id: `grid-${index + 1}`, source: 'aria', headers: rows[0] || [], rows: rows.slice(1) };
}

function capture() {
  const tables = Array.from(document.querySelectorAll('table')).filter(visible).map(htmlTable);
  const grids = Array.from(document.querySelectorAll('[role="grid"]')).filter(visible).map(ariaGrid);
  const headings = Array.from(document.querySelectorAll('h1,h2,[role="heading"]')).filter(visible).slice(0, 20).map(text).filter(Boolean);
  return {
    schemaVersion: 1,
    provider: provider(),
    capturedAt: new Date().toISOString(),
    url: location.href,
    title: document.title,
    headings,
    tables: [...tables, ...grids].filter((item) => item.headers.length || item.rows.length),
  };
}

chrome.runtime.onMessage.addListener((message, _sender, respond) => {
  if (message?.type !== 'PAPRIKA_CAPTURE') return false;
  try { respond({ ok: true, snapshot: capture() }); }
  catch (error) { respond({ ok: false, error: String(error) }); }
  return true;
});
