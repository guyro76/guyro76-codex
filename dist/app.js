const transparencyMessage = "האפליקציה עובדת רק עם API רשמי של Instagram / Meta. חלק מהפעולות עשויות להיות מוגבלות בהתאם להרשאות שמטה מאפשרת. במקרים כאלה נפתח את הפרופיל באינסטגרם לביצוע ידני.";
const apiLimitationMessage = "הפעולה אינה נתמכת דרך API רשמי. פתחנו עבורך את הפרופיל באינסטגרם לביצוע ידני.";
const demoStats = { followers: 1842, following: 1127, notFollowingBack: 286, fans: 73, mutual: 1041, suspicious: 38, vip: 24, newFollowers: 47, lostFollowers: 19, health: 84, quality: 82, lastScan: "15 במאי 2026, 09:30" };
const scanSteps = ["מתחברים לחשבון", "בודקים הרשאות", "מושכים נתונים זמינים", "משווים רשימות", "מזהים קשרים הדדיים", "מזהים חשבונות לבדיקה", "בונים דוח", "מסיימים"];
const features = ["מגלה מי לא עוקב אחריך בחזרה", "מגלה מי עוקב אחריך ואתה לא עוקב אחריו", "מציגה מעקב הדדי", "מזהה חשבונות חשודים", "שומרת רשימת VIP", "נותנת המלצות חכמות", "יוצרת דוחות", "עוקבת אחרי שינויים לאורך זמן"];
const reports = ["דוח סריקה מלא", "דוח לא עוקבים חזרה", "דוח עוקבים שאני לא עוקב אחריהם", "דוח חשבונות חשודים", "דוח VIP", "דוח שינויים בין סריקות", "דוח המלצות ניקוי"];
const pages = ["Landing Page", "Login", "OAuth Callback", "Connection Status", "Dashboard", "Followers I Don’t Follow Back", "Following Not Following Me Back", "Mutual Followers", "Suspicious Accounts", "Ghost Followers", "Fans / Worth Following Back", "VIP List", "Watchlist", "Recent Changes", "Scan History", "Reports", "Notifications", "Settings", "Privacy Center", "Terms of Use", "Help / FAQ", "Demo Mode"];
const settings = ["עברית / English בעתיד", "Light / Dark Mode", "יומית / שבועית / חודשית / ידנית", "ניהול התראות", "ניהול VIP", "ניהול Watchlist", "ניתוק Instagram / Google / Apple / Facebook", "מחיקת נתונים מלאה", "מחיקת חשבון", "ייצוא מידע אישי"];
const capabilities = [
  ["OAuth Instagram / Meta", "נתמך", "התחברות באמצעות OAuth בלבד, ללא סיסמאות."],
  ["פרטי חשבון וספירות", "נתמך חלקית", "זמינות תלויה בסוג החשבון ובהרשאות שאושרו."],
  ["רשימות followers/following מלאות", "מוגבל", "אין להציג כזמין אם Meta אינה מספקת הרשאה רשמית לחשבון המחובר."],
  ["Follow / Unfollow / Remove", "ידני", "כאשר פעולה אינה נתמכת רשמית, פותחים את Instagram ומבקשים סימון ידני."],
  ["נתוני אינטראקציה", "מוגבל", "מוצגים רק אם התקבלו דרך הרשאות API מאושרות."]
];
const insights = [
  "יש לך 286 חשבונות שאתה עוקב אחריהם שלא עוקבים אחריך.",
  "73 עוקבים אחריך ואתה לא עוקב אחריהם — ייתכן שחלקם Fans איכותיים.",
  "38 חשבונות נראים חשודים ודורשים בדיקה ידנית.",
  "45 חשבונות מסומנים כקשרים איכותיים.",
  "יחס העוקבים שלך השתפר מהסריקה הקודמת.",
  "מומלץ לבדוק קודם את 20 החשבונות עם ציון ההסרה הגבוה ביותר.",
  "יש לך קהילה די איכותית, אבל כדאי לנקות חשבונות לא פעילים.",
  "נראה שיש יותר מדי חשבונות שאתה עוקב אחריהם שלא מחזירים עוקב."
];
const chartData = [1510, 1588, 1662, 1765, 1842];
const bars = [42, 57, 63, 71, 47];
const names = ["נועה לוי", "דניאל כהן", "מאיה רוזן", "אורי ביטון", "שירה גל", "תומר רז", "ליה עמר", "איתן מור", "רוני שלו", "יעל ברק"];
const bios = ["יוצרת תוכן ולייפסטייל", "עסק קטן עם לב גדול", "צילום, קפה ושקיעות", "שיווק דיגיטלי ביום, מוזיקה בלילה", "מטיילת ומספרת סיפורים", "מותג בוטיק מקומי"];
const avatars = ["🌸", "🎧", "📷", "☕", "🚀", "💎", "🌊", "🍋", "🦊", "🎨"];
const relationships = ["fan", "not-following", "mutual", "suspicious", "vip", "watchlist", "ghost"];
const profiles = Array.from({ length: 84 }, (_, index) => {
  const relationship = index % 13 === 0 ? "suspicious" : index % 11 === 0 ? "vip" : index % 7 === 0 ? "not-following" : index % 5 === 0 ? "fan" : index % 17 === 0 ? "ghost" : index % 19 === 0 ? "watchlist" : "mutual";
  const followers = 120 + ((index * 137) % 18200);
  const following = 45 + ((index * 83) % 3900);
  const risk = relationship === "suspicious" ? 78 + (index % 18) : 12 + (index % 42);
  return {
    username: `insta_${["creator", "brand", "friend", "studio", "traveler"][index % 5]}_${index + 1}`,
    fullName: names[index % names.length], avatar: avatars[index % avatars.length], bio: bios[index % bios.length], relationship,
    verified: index % 13 === 0, private: index % 8 === 0, followers, following, posts: 3 + ((index * 11) % 520), risk,
    category: ["חבר", "יוצר", "מותג", "לקוח", "השראה", "חשוד"][index % 6], detectedAt: `2026-05-${String(1 + (index % 14)).padStart(2, "0")}`,
    followBack: Math.min(99, 42 + (index * 7) % 58), unfollow: Math.min(96, 20 + (index * 9) % 70), keep: Math.min(98, 38 + (index * 5) % 60), vipProb: Math.min(97, 18 + (index * 4) % 70)
  };
});
const metrics = [
  ["סך כל העוקבים", "1,842", "+4.8%", "מספר העוקבים הזמין בסריקה האחרונה."], ["חשבונות שאני עוקב", "1,127", "-2.1%", "סך החשבונות שאתה עוקב אחריהם."], ["יחס Followers / Following", "1.63", "+0.2", "יחס גבוה יותר מעיד בדרך כלל על קהילה בריאה יותר."], ["מעקב הדדי", "1,041", "+31", "חשבונות שיש איתם קשר הדדי."], ["עוקבים שאני לא עוקב", "73", "+12", "Fans שכדאי לשקול לעקוב אחריהם בחזרה."], ["לא עוקבים חזרה", "286", "-18", "חשבונות שאתה עוקב אחריהם אך הם לא עוקבים אחריך."], ["עוקבים חדשים", "47", "+9", "זוהו בין הסריקה הקודמת לנוכחית."], ["עוקבים שאבדו", "19", "-6", "חשבונות שלא מופיעים יותר כעוקבים בין סריקות."], ["חשבונות חשודים", "38", "+3", "סימנים אפשריים בלבד; מומלץ לבדוק ידנית."], ["חשבונות VIP", "24", "+5", "חשבונות שסומנו כאל תיגע."], ["ציון בריאות", "84", "+7", "מדד פנימי מ־0 עד 100 למצב החשבון."], ["איכות קהילה", "82", "+4", "מדד איכות קהילה המבוסס על קשרים, סיכון ו־VIP."], ["סריקה אחרונה", "09:30", "היום", "תאריך ושעת הסריקה האחרונה."], ["סטטוס API", "חלקי", "OAuth", "חלק מהפעולות מוגבלות לפי הרשאות Meta."]
];
function normalizeUsername(username) { return username.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/^@+/, "").trim().toLowerCase(); }
function compareRelationships(followers, following, previous = []) {
  const followersSet = new Set(followers.map(normalizeUsername).filter(Boolean));
  const followingSet = new Set(following.map(normalizeUsername).filter(Boolean));
  const previousSet = new Set(previous.map(normalizeUsername).filter(Boolean));
  return {
    followersIDontFollowBack: [...followersSet].filter((name) => !followingSet.has(name)),
    followingNotFollowingMeBack: [...followingSet].filter((name) => !followersSet.has(name)),
    mutualFollowers: [...followersSet].filter((name) => followingSet.has(name)),
    recentNewFollowers: [...followersSet].filter((name) => !previousSet.has(name)),
    recentLostFollowers: [...previousSet].filter((name) => !followersSet.has(name))
  };
}
window.INSTAWATCHER = { normalizeUsername, compareRelationships };
function instagramOAuthUrl() {
  const clientId = "YOUR_META_APP_ID";
  const redirectUri = encodeURIComponent(`${location.origin}${location.pathname}#oauth-callback`);
  const scope = encodeURIComponent("instagram_business_basic,instagram_business_manage_insights");
  return `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
}
function openProfile(username) { window.open(`https://www.instagram.com/${username}/`, "_blank", "noopener,noreferrer"); }
function manualAction(username) { alert(apiLimitationMessage); openProfile(username); }
function statCards() { return metrics.map(([label, value, change, help]) => `<a class="card stat" href="#dashboard" title="${help}"><span class="icon">✦</span><small>${label}</small><strong>${value}</strong><em>${change}</em><p>${help}</p></a>`).join(""); }
function gauge(title, value) { return `<article class="card gauge-card"><div class="gauge" style="--score:${value}"><span>${value}</span></div><h3>${title}</h3><p>מדד מ־0 עד 100 המבוסס על יחס עוקבים/נעקבים, מעקב הדדי, חשבונות חשודים, יציבות, VIP ואינטראקציה זמינה.</p></article>`; }
function profileCard(profile) {
  const recommendation = profile.relationship === "not-following" ? "מומלץ לבדוק ידנית" : profile.relationship === "fan" ? "ייתכן שכדאי לעקוב חזרה" : profile.relationship === "vip" ? "מסומן כ־VIP, לא לגעת" : profile.risk > 70 ? "זוהו סימנים אפשריים בלבד" : "מומלץ להשאיר";
  return `<article class="profile card" data-relationship="${profile.relationship}" data-username="${profile.username}" data-risk="${profile.risk}"><div class="profile-head"><div class="avatar">${profile.avatar}</div><div><h3>@${profile.username} ${profile.verified ? "✅" : ""}</h3><p>${profile.fullName} · ${profile.category} · ${profile.private ? "פרטי" : "ציבורי"}</p></div><input type="checkbox" aria-label="בחר ${profile.username}" /></div><p class="bio">${profile.bio}</p><div class="mini-grid"><span><b>${profile.followers.toLocaleString()}</b> עוקבים</span><span><b>${profile.following.toLocaleString()}</b> נעקבים</span><span><b>${(profile.followers / Math.max(profile.following, 1)).toFixed(1)}</b> יחס</span></div><span class="badge">${recommendation}</span><p class="reason">המלצה זו מבוססת על יחס עוקבים, סוג החשבון, פעילות זמינה והאם קיים מעקב הדדי.</p><div class="scores">${[["Follow Back", profile.followBack], ["Unfollow", profile.unfollow], ["Risk", profile.risk], ["Keep", profile.keep], ["VIP", profile.vipProb]].map(([label, value]) => `<label>${label}<i style="--w:${value}%"></i><b>${value}</b></label>`).join("")}</div><div class="actions"><button onclick="manualAction('${profile.username}')">עקוב / הסר ידנית</button><button onclick="alert('סימנו את החשבון כ־VIP')">סמן VIP</button><button onclick="alert('החשבון נוסף לרשימת מעקב')">Watchlist</button><button onclick="openProfile('${profile.username}')">פתח באינסטגרם</button></div></article>`;
}
function listSection(id, title, subtitle, rel) {
  const list = profiles.filter((p) => rel.includes(p.relationship)).slice(0, 10).map(profileCard).join("") || `<div class="empty card">הרשימה נקייה.</div>`;
  return `<section id="${id}" class="section"><div class="section-title"><p>Relationship List</p><h2>${title}</h2><span>${subtitle}</span></div><div class="list-layout"><aside class="filters card"><h3>🔎 חיפוש וסינון</h3><input id="search-${id}" placeholder="חיפוש לפי שם משתמש או שם מלא" oninput="filterCards('${id}', this.value)" /><button>VIP</button><button>חשוד</button><button>מאומת</button><button>פרטי / ציבורי</button><button>קטגוריה</button><button>יחס עוקבים</button><button>ציון המלצה</button><button>תאריך זיהוי</button><div class="warning">פעולות רבות מדי בזמן קצר עלולות לגרום להגבלות באינסטגרם. מומלץ לפעול בזהירות.</div></aside><div class="profiles">${list}</div></div></section>`;
}
function filterCards(id, value) {
  document.querySelectorAll(`#${id} .profile`).forEach((card) => { card.hidden = !card.dataset.username.includes(value.toLowerCase()); });
}
function barsSvg() { return `<svg class="chart" viewBox="0 0 500 240" role="img" aria-label="גרף גידול עוקבים"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#ec4899"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs><polyline points="30,190 135,155 240,120 345,82 470,45" fill="none" stroke="url(#g)" stroke-width="10" stroke-linecap="round"/><path d="M30 190 L135 155 L240 120 L345 82 L470 45 L470 220 L30 220Z" fill="#ec489933"/>${chartData.map((v,i)=>`<circle cx="${30+i*105}" cy="${190-i*36}" r="8" fill="#8b5cf6"/>`).join("")}${bars.map((v,i)=>`<rect x="${60+i*85}" y="${220-v*2}" width="30" height="${v*2}" rx="8" fill="#8b5cf688"/>`).join("")}</svg>`; }
function apiNotice() { return `<div class="notice">🛡️ ${transparencyMessage}</div>`; }
function render() {
  document.getElementById("app").innerHTML = `
    <aside class="sidebar"><b>📸 INSTAWATCHER</b><a href="#dashboard">דשבורד</a><a href="#connection">סטטוס חיבור</a><a href="#fans">Fans</a><a href="#not-following">לא עוקבים חזרה</a><a href="#mutual">מעקב הדדי</a><a href="#suspicious">חשודים</a><a href="#reports">דוחות</a><a href="#privacy">פרטיות</a></aside>
    <nav class="bottom-nav"><a href="#dashboard">📊<span>דשבורד</span></a><a href="#fans">💗<span>Fans</span></a><a href="#not-following">➖<span>ניקוי</span></a><a href="#reports">📄<span>דוחות</span></a></nav>
    <button class="theme" onclick="document.body.classList.toggle('dark')">🌙</button>
    <main>
      <section class="hero"><header><div class="brand"><span>📸</span><b>INSTAWATCHER</b><small>Instagram Followers Manager</small></div><a class="pill" href="#login">התחבר עם Instagram</a></header><div class="hero-grid"><div><span class="safe">OAuth רשמי בלבד · ללא סיסמאות · ללא סקרייפינג</span><h1>גלה מי באמת עוקב אחריך באינסטגרם</h1><p>INSTAWATCHER מנתחת את החשבון שלך, מזהה מי לא עוקב חזרה, מי שווה שימור, מי נראה חשוד, ומציגה לך המלצות חכמות במקום אחד.</p><h2>גלה מי באמת עוקב אחריך.</h2><p>התחבר לאינסטגרם, קבל ניתוח חכם של העוקבים שלך, וגלה את מי כדאי לשמר, להחזיר, לבדוק או להסיר.</p><div class="cta"><a href="${instagramOAuthUrl()}">התחבר עם Instagram</a><a href="#dashboard">צפה בדמו</a></div></div><div class="mockup card"><h3>דשבורד חי</h3><div class="stats-mini"><span>1,842 עוקבים</span><span>286 לא מחזירים</span><span>84 Health</span></div>${barsSvg()}<div class="floating one">💗 73 Fans</div><div class="floating two">🛡️ 38 לבדיקה</div></div></div></section>
      <section id="features" class="section"><div class="section-title"><p>יכולות</p><h2>מה האפליקציה יודעת לעשות?</h2><span>דשבורד SaaS פרימיום שמציג רק יכולות חוקיות ומסמן בבירור מגבלות API.</span></div><div class="feature-grid">${features.map((f,i)=>`<article class="card"><span class="icon">${i+1}</span><h3>${f}</h3></article>`).join("")}</div></section>
      <section id="login" class="section login"><div class="section-title"><p>Login</p><h2>התחברות נקייה ומאובטחת</h2><span>אנחנו לא מבקשים ולא שומרים את סיסמת האינסטגרם שלך. ההתחברות מתבצעת רק דרך OAuth רשמי ומאובטח.</span></div><div class="login-grid"><article class="card login-card"><a href="${instagramOAuthUrl()}">Continue with Instagram</a><a href="#connection">Continue with Facebook / Meta</a><a href="#dashboard">Continue with Google</a><a href="#dashboard">Continue with Apple</a><a href="#dashboard">מצב Demo ללא התחברות</a><p>בודקים אילו נתונים זמינים דרך API רשמי, מציגים סטטוס תמיכה ולא מבצעים פעולה שאינה נתמכת.</p></article><article id="connection" class="card"><h3>סטטוס חיבור</h3><b class="badge">נתמך חלקית</b>${capabilities.map(([f,s,n])=>`<div class="cap"><b>${f}</b><em>${s}</em><p>${n}</p></div>`).join("")}<button>רענן הרשאות</button><button>נתק חשבון</button></article></div></section>
      <section id="dashboard" class="section"><div class="section-title"><p>Demo Mode</p><h2>דשבורד חכם בעברית מלאה</h2><span>מצב הדמו כולל 1,842 עוקבים, 1,127 נעקבים, 286 לא עוקבים חזרה, 73 Fans, 1,041 מעקב הדדי, 38 חשבונות חשודים ו־24 VIP.</span></div>${apiNotice()}<div class="stats-grid">${statCards()}</div><div class="dashboard-grid">${gauge("Account Health Score", demoStats.health)}${gauge("Community Quality Score", demoStats.quality)}<article class="card charts"><h3>גרפים ותובנות לאורך זמן</h3>${barsSvg()}<div class="insights">${insights.map((i)=>`<p>✨ ${i}</p>`).join("")}</div></article></div></section>
      ${listSection("fans", "עוקבים אחריי ואני לא עוקב אחריהם", "כולל ציון המלצה לעקוב חזרה, סיבה, תגיות וכפתורי פעולה. אם Follow Back אינו נתמך רשמית, נפתח את הפרופיל לביצוע ידני.", ["fan"])}
      ${listSection("not-following", "אני עוקב אחריהם והם לא עוקבים אחריי", "רשימת ניקוי חכמה עם ציון הסרה, Keep Score, VIP Probability והמלצות שאינן מוצגות כוודאות מוחלטת.", ["not-following"])}
      ${listSection("mutual", "מעקב הדדי", "חשבונות עם קשר הדדי: סמן VIP, פתח באינסטגרם, הוסף הערה, סנן לפי פעילות, מאומתים, מותגים, חברים ויוצרים.", ["mutual"])}
      ${listSection("suspicious", "חשבונות חשודים", "זוהו סימנים אפשריים בלבד. מומלץ לבדוק ידנית לפני פעולה.", ["suspicious"])}
      ${listSection("ghost", "Ghost Followers – עוקבים רפאים", "נתוני אינטראקציה מלאים אינם זמינים דרך ההרשאות הנוכחיות.", ["ghost", "suspicious"])}
      ${listSection("vip", "VIP / אל תיגע", "קטגוריות VIP: משפחה, חברים, לקוחות, קולגות, מותגים, יוצרים, השראה ואחר. חשבונות VIP לא יופיעו בהמלצות הסרה.", ["vip"])}
      ${listSection("watchlist", "Watchlist – רשימת מעקב", "חשבונות לבדיקה עתידית: האם החזירו עוקב, הפסיקו לעקוב, פעילים או כדאי להסיר בעתיד.", ["watchlist", "fan"])}
      <section class="section"><article class="card"><div class="section-title"><p>סריקות</p><h2>סרוק עכשיו והשווה מול סריקה קודמת</h2><span>אם הנתונים אינם זמינים בזמן אמת, מוצגים שינויים רק בין סריקות.</span></div><button onclick="simulateScan()">סרוק עכשיו</button><div class="steps">${scanSteps.map((s,i)=>`<div><i style="--w:${(i+1)*12.5}%"></i><b>${i+1}. ${s}</b></div>`).join("")}</div></article></section>
      <section id="reports" class="section"><div class="section-title"><p>Reports</p><h2>דוחות, ייצוא וגרפים</h2><span>ייצוא ל־PDF, CSV, Excel ו־JSON עם לוגו INSTAWATCHER, תאריך סריקה, תקציר מנהלים, גרפים, רשימות, המלצות והערת מגבלות API.</span></div><div class="reports-grid"><article class="card">${reports.map((r)=>`<button onclick="downloadReport('${r}')">📄 ${r}</button>`).join("")}</article><article class="card"><h3>התפלגות קהילה</h3><div class="donut"></div><p>הדדי · לא מחזירים · Fans · חשודים · VIP</p></article></div></section>
      <section class="section"><div class="two-col"><article class="card"><h3>Recent Changes & Notifications</h3>${["עוקב חדש", "מישהו הפסיק לעקוב", "שינוי חד בכמות העוקבים", "חשבון חשוד חדש", "VIP הפסיק לעקוב", "הגיע הזמן לסריקה שבועית"].map(n=>`<p class="note">🔔 ${n}</p>`).join("")}</article><article class="card"><h3>Gamification</h3>${["ציון בריאות שבועי", "Badge על שיפור יחס עוקבים", "Badge על ניקוי חשבונות חשודים", "יעד שבועי: בדוק 10 חשבונות"].map((n,i)=>`<label class="progress">${n}<i style="--w:${60+i*10}%"></i></label>`).join("")}</article></div></section>
      <section id="settings" class="section"><article class="card"><div class="section-title"><p>Settings</p><h2>הגדרות וניהול חשבון</h2><span>שפה, מצב כהה, סריקות, התראות, VIP, Watchlist, ניתוק ספקים, מחיקת נתונים וייצוא מידע אישי.</span></div><div class="feature-grid">${settings.map(s=>`<button>${s}</button>`).join("")}</div></article></section>
      <section class="section"><div class="section-title"><p>Architecture</p><h2>מבנה עמודים מלא</h2><span>מוכן להמשך פיתוח עם Next.js, Auth.js, Prisma, PostgreSQL, Jobs, PDF וטוקנים מוצפנים.</span></div><div class="feature-grid pages">${pages.map(p=>`<span class="card">${p}</span>`).join("")}</div></section>
      <section id="privacy" class="section"><div class="three-col"><article class="card"><h3>Privacy Center</h3><p>שמירת מידע מינימלית, הצפנת Tokens, Secure Cookies, CSRF Protection, XSS Protection, Audit Log, הרשאות לפי משתמש, מחיקת סריקות, ניתוק Instagram ומחיקת חשבון בכל רגע.</p></article><article class="card"><h3>Terms of Use</h3><p>האפליקציה אינה Instagram ואינה Meta. היא משתמשת רק בהרשאות רשמיות; חלק מהפעולות מוגבלות והמשתמש אחראי לפעולות ידניות שהוא מבצע באינסטגרם.</p></article><article id="faq" class="card"><h3>Help / FAQ</h3>${[["האם אתם שומרים את הסיסמה שלי?", "לא. ההתחברות מתבצעת דרך OAuth רשמי בלבד."], ["למה חלק מהכפתורים פותחים את Instagram?", "כי לא כל פעולה נתמכת דרך API רשמי."], ["למה אני לא רואה את כל הנתונים?", "תלוי בהרשאות ובסוג החשבון."], ["האם צריך חשבון Business או Creator?", "ייתכן שחלק מהיכולות ידרשו זאת."], ["האם האפליקציה יכולה להסיר עוקבים לבד?", "רק אם פעולה כזו נתמכת רשמית. אחרת הפעולה תתבצע ידנית באינסטגרם."], ["האם זה בטוח לחשבון שלי?", "האפליקציה תוכננה לעבוד רק עם API רשמי ולהימנע מאוטומציה אסורה."]].map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</article></div></section>
      <footer>${apiNotice()}<p>© 2026 INSTAWATCHER. לא Instagram ולא Meta. מוצר דמו חוקי ושקוף.</p></footer>
    </main>`;
}
function simulateScan() { alert(scanSteps.join("\n")); }
function downloadReport(reportType) {
  const payload = { brand: "INSTAWATCHER", reportType, generatedAt: new Date().toISOString(), demoStats, insights, apiLimitationsNote: transparencyMessage };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `instawatcher-${reportType.replaceAll(" ", "-")}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
Object.assign(window, { openProfile, manualAction, filterCards, simulateScan, downloadReport });
render();
