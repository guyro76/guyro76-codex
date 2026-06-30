import * as cheerio from "cheerio";
import type { AnalysisCheck, AnalysisResult, Category, Priority } from "@/types/analyze";
import { normalizeUrl, safeFetch } from "@/lib/security";

const clean = (v: string) => v.replace(/\s+/g, " ").trim();
const status = (n: number) => n >= 80 ? "pass" as const : n >= 50 ? "warning" as const : "fail" as const;
const priority = (w: number, n: number): Priority => n >= 80 ? "opportunity" : w >= 10 ? "critical" : w >= 7 ? "high" : "medium";
const item = (id: string, category: Category, title: string, score: number, weight: number, finding: string, recommendation: string, evidence?: string): AnalysisCheck => ({ id, category, title, score, weight, status: status(score), priority: priority(weight, score), finding, recommendation, evidence });
const weighted = (checks: AnalysisCheck[], category: Category) => {
  const rows = checks.filter((x) => x.category === category);
  const total = rows.reduce((s, x) => s + x.weight, 0);
  return total ? Math.round(rows.reduce((s, x) => s + x.score * x.weight, 0) / total) : 0;
};

async function auxiliary(url: URL) {
  try {
    const r = await safeFetch(url, { timeoutMs: 5000, maxBytes: 350000, accept: "text/plain,application/xml,text/xml,*/*" });
    return { ok: r.response.ok, body: r.body, finalUrl: r.finalUrl.toString() };
  } catch { return { ok: false, body: "", finalUrl: url.toString() }; }
}

function access(robots: string, agent: string): "allowed" | "blocked" | "unknown" {
  if (!robots) return "unknown";
  const blocks = robots.split(/(?=^\s*user-agent\s*:)/gim);
  const exact = blocks.find((b) => new RegExp(`user-agent\\s*:\\s*${agent}`, "i").test(b));
  const generic = blocks.find((b) => /user-agent\s*:\s*\*/i.test(b));
  const block = exact || generic;
  if (!block) return "allowed";
  return /^\s*disallow\s*:\s*\/\s*$/im.test(block) ? "blocked" : "allowed";
}

function schemaData($: cheerio.CheerioAPI) {
  const types = new Set<string>();
  let errors = 0;
  const walk = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) return v.forEach(walk);
    const r = v as Record<string, unknown>;
    const t = r["@type"];
    if (typeof t === "string") types.add(t);
    if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x));
    Object.values(r).forEach(walk);
  };
  $("script[type='application/ld+json']").each((_, el) => {
    try { walk(JSON.parse($(el).text())); } catch { errors += 1; }
  });
  return { types: [...types].sort(), errors };
}

function keywords(text: string) {
  const stop = new Set(["של","את","על","עם","זה","היא","הוא","גם","כל","the","and","for","with","this","that","from","your"]);
  const map = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]{2,}/gu) || []) {
    if (!stop.has(word) && !/^\d+$/.test(word)) map.set(word, (map.get(word) || 0) + 1);
  }
  return [...map.entries()].sort((a,b) => b[1]-a[1]).slice(0,10).map(([w]) => w);
}

export async function analyzeWebsite(input: string): Promise<AnalysisResult> {
  const requested = normalizeUrl(input);
  const start = Date.now();
  const page = await safeFetch(requested);
  const durationMs = Date.now() - start;
  const contentType = page.response.headers.get("content-type") || "";
  if (!page.response.ok) throw new Error(`האתר החזיר קוד HTTP ${page.response.status}`);
  if (!/html|xhtml/i.test(contentType)) throw new Error("הכתובת אינה מחזירה עמוד HTML שניתן לנתח");

  const $ = cheerio.load(page.body);
  const title = clean($("title").first().text());
  const description = clean($("meta[name='description']").attr("content") || "");
  const canonicalRaw = $("link[rel='canonical']").first().attr("href") || "";
  let canonical = canonicalRaw;
  try { canonical = canonicalRaw ? new URL(canonicalRaw, page.finalUrl).toString() : ""; } catch {}
  const robotsMeta = clean($("meta[name='robots']").attr("content") || "").toLowerCase();
  const h1 = $("h1").map((_, el) => clean($(el).text())).get().filter(Boolean);
  const h2 = $("h2").map((_, el) => clean($(el).text())).get().filter(Boolean);
  const textRoot = $("body").clone();
  textRoot.find("script,style,noscript,template,svg").remove();
  const bodyText = clean(textRoot.text());
  const wordCount = (bodyText.match(/[\p{L}\p{N}]+/gu) || []).length;
  const images = $("img").length;
  const imagesMissingAlt = $("img").filter((_, el) => !clean($(el).attr("alt") || "")).length;
  const lazyImages = $("img[loading='lazy']").length;
  const sizedImages = $("img").filter((_, el) => Boolean($(el).attr("width") && $(el).attr("height"))).length;
  const scripts = $("script[src]").length;
  let internalLinks = 0, externalLinks = 0;
  $("a[href]").each((_, el) => { try { const u = new URL($(el).attr("href") || "", page.finalUrl); u.hostname === page.finalUrl.hostname ? internalLinks++ : (["http:","https:"].includes(u.protocol) && externalLinks++); } catch {} });
  const questionHeadings = $("h2,h3").filter((_, el) => /[?？]$|^(מה|איך|למה|האם|כמה|what|how|why|is|can)\b/i.test(clean($(el).text()))).length;
  let answerBlocks = 0;
  $("h2,h3").each((_, el) => { const q = clean($(el).text()); const a = clean($(el).nextAll("p").first().text()); if ((/[?？]$/.test(q) || /^(מה|איך|למה|האם|what|how|why)/i.test(q)) && a.length >= 45 && a.length <= 420) answerBlocks++; });
  const { types: schemaTypes, errors: jsonLdErrors } = schemaData($);
  const origin = page.finalUrl.origin;
  const robots = await auxiliary(new URL("/robots.txt", origin));
  const googlebot = access(robots.body, "googlebot");
  const oaiSearchBot = access(robots.body, "oai-searchbot");
  const gptBot = access(robots.body, "gptbot");
  const sitemapHints = [...new Set([...(robots.body.match(/^\s*Sitemap:\s*(.+)$/gim) || []).map((x) => x.replace(/^\s*Sitemap:\s*/i, "").trim()), `${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`])];
  let sitemapFound = false, sitemapUrl = "";
  for (const candidate of sitemapHints.slice(0,3)) { try { const r = await auxiliary(new URL(candidate)); if (r.ok && /<(urlset|sitemapindex)\b/i.test(r.body)) { sitemapFound = true; sitemapUrl = r.finalUrl; break; } } catch {} }
  const llms = await auxiliary(new URL("/llms.txt", origin));
  const llmsTxtFound = llms.ok && llms.body.trim().length > 20;
  const indexBlocked = robotsMeta.includes("noindex");
  const hasEntity = schemaTypes.some((x) => ["Organization","LocalBusiness","Person","Corporation","ProfessionalService"].includes(x));
  const hasFaq = schemaTypes.some((x) => ["FAQPage","QAPage"].includes(x));
  const firstParagraph = clean($("main p,article p,body p").first().text());
  const summaryScore = firstParagraph.length >= 70 && firstParagraph.length <= 400 ? 100 : firstParagraph.length >= 40 ? 60 : 20;
  const listCount = $("ul,ol").length, tableCount = $("table").length;
  const lang = $("html").attr("lang") || "", dir = $("html").attr("dir") || "";
  const viewport = Boolean($("meta[name='viewport']").attr("content"));
  const favicon = $("link[rel*='icon']").length > 0;
  const checks: AnalysisCheck[] = [];

  checks.push(item("http","SEO","זמינות וקוד תגובה",page.response.status===200?100:50,10,`HTTP ${page.response.status}`,"ודאו שהעמוד מחזיר 200 ללא שרשרת הפניות מיותרת."));
  checks.push(item("https","SEO","HTTPS",page.finalUrl.protocol==="https:"?100:0,6,page.finalUrl.protocol==="https:"?"העמוד מאובטח ב-HTTPS.":"העמוד אינו מאובטח.","העבירו את האתר ל-HTTPS."));
  checks.push(item("title","SEO","כותרת עמוד",title.length>=30&&title.length<=60?100:title?55:0,10,title?`אורך הכותרת ${title.length} תווים.`:"לא נמצאה title.","כתבו כותרת ייחודית וברורה של כ-30 עד 60 תווים.",title||undefined));
  checks.push(item("description","SEO","תיאור מטא",description.length>=110&&description.length<=165?100:description?55:0,8,description?`אורך התיאור ${description.length} תווים.`:"לא נמצא meta description.","נסחו תיאור מדויק שמציג ערך ותועלת.",description||undefined));
  checks.push(item("canonical","SEO","כתובת קנונית",canonical?100:20,8,canonical?"נמצא canonical.":"לא נמצא canonical.","הוסיפו canonical מוחלט ועקבי.",canonical||undefined));
  checks.push(item("index","SEO","אפשרות אינדוקס",indexBlocked?0:100,12,indexBlocked?"נמצאה הוראת noindex.":"לא נמצאה הוראת noindex.","הסירו noindex מעמודים שאמורים להופיע בחיפוש."));
  checks.push(item("h1","SEO","מבנה H1",h1.length===1?100:h1.length?50:0,8,`נמצאו ${h1.length} כותרות H1.`,"השתמשו ב-H1 אחד שמגדיר את נושא העמוד."));
  checks.push(item("content","SEO","עומק תוכן",wordCount>=700?100:wordCount>=350?70:wordCount>=180?45:20,7,`זוהו ${wordCount} מילים.`,"הוסיפו מידע מקורי, דוגמאות, שאלות ומקורות לפי כוונת החיפוש."));
  checks.push(item("alt","SEO","טקסט חלופי לתמונות",images?Math.round((images-imagesMissingAlt)/images*100):100,5,images?`${imagesMissingAlt} מתוך ${images} תמונות ללא alt.`:"אין תמונות.","הוסיפו alt תיאורי לתמונות משמעותיות."));
  checks.push(item("schema","SEO","נתונים מובנים",schemaTypes.length&&!jsonLdErrors?100:schemaTypes.length?60:20,8,schemaTypes.length?`Schema: ${schemaTypes.join(", ")}`:"לא נמצא JSON-LD.","הוסיפו JSON-LD מדויק שתואם לתוכן הגלוי."));
  checks.push(item("sitemap","SEO","Sitemap",sitemapFound?100:30,6,sitemapFound?"נמצא sitemap תקין.":"לא אותר sitemap XML.","צרו sitemap עם כתובות קנוניות."));
  checks.push(item("mobile","SEO","התאמה למובייל",viewport?100:20,5,viewport?"נמצאה תגית viewport.":"תגית viewport חסרה.","הוסיפו viewport ובדקו את הממשק במובייל."));

  checks.push(item("oai","GEO","נגישות לחיפוש ChatGPT",oaiSearchBot==="blocked"?0:oaiSearchBot==="allowed"?100:70,14,`OAI-SearchBot: ${oaiSearchBot}.`,"אפשרו OAI-SearchBot אם ברצונכם להופיע בחיפוש ChatGPT."));
  checks.push(item("entity","GEO","ישות ומותג מזוהים",hasEntity?100:30,12,hasEntity?"נמצאה ישות מרכזית ב-Schema.":"לא נמצאה ישות ארגונית ברורה.","הוסיפו Organization, LocalBusiness או Person עם פרטים אמיתיים."));
  checks.push(item("evidence","GEO","מקורות ואסמכתאות",externalLinks>=2?100:externalLinks?60:25,10,`נמצאו ${externalLinks} קישורים חיצוניים.`,"הוסיפו מקורות ראשוניים וקישורים תומכים לטענות."));
  checks.push(item("summary","GEO","סיכום ברור בתחילת התוכן",summaryScore,9,firstParagraph?`הפסקה הראשונה באורך ${firstParagraph.length} תווים.`:"לא זוהתה פסקת פתיחה.","פתחו בתשובה קצרה וברורה ואז הרחיבו."));
  checks.push(item("semantic","GEO","מבנה סמנטי",h2.length>=3?100:h2.length?60:20,8,`נמצאו ${h2.length} כותרות H2.`,"חלקו את התוכן לפרקים בעלי כותרות תיאוריות."));
  checks.push(item("llms","GEO","llms.txt ניסיוני",llmsTxtFound?100:50,2,llmsTxtFound?"נמצא llms.txt.":"לא נמצא llms.txt.","אפשר לשקול llms.txt כתוספת בלבד, לא כתחליף ל-sitemap ול-Schema."));

  checks.push(item("questions","AEO","כותרות בצורת שאלות",questionHeadings>=4?100:questionHeadings>=2?70:questionHeadings?50:15,12,`נמצאו ${questionHeadings} כותרות שאלה.`,"הוסיפו שאלות אמיתיות של משתמשים כ-H2 או H3."));
  checks.push(item("answers","AEO","תשובות קצרות הניתנות לציטוט",answerBlocks>=3?100:answerBlocks?65:15,14,`נמצאו ${answerBlocks} מקטעי תשובה ישירים.`,"לאחר כל שאלה כתבו תשובה של 2 עד 4 משפטים ואז הרחבה."));
  checks.push(item("faq","AEO","FAQ או Q&A מובנים",hasFaq?100:questionHeadings>=3?60:20,7,hasFaq?"נמצא FAQPage או QAPage.":"לא נמצא FAQ Schema.","הוסיפו FAQPage רק כאשר התוכן מוצג למשתמש ומתאים להנחיות."));
  checks.push(item("lists","AEO","רשימות וטבלאות",listCount+tableCount>=4?100:listCount+tableCount>=2?70:listCount+tableCount?50:20,8,`נמצאו ${listCount} רשימות ו-${tableCount} טבלאות.`,"השתמשו ברשימות לשלבים ובטבלאות להשוואות."));
  checks.push(item("internal","AEO","קישורים פנימיים",internalLinks>=5?100:internalLinks>=2?65:25,5,`נמצאו ${internalLinks} קישורים פנימיים.`,"קשרו למדריכים ולשאלות משלימות."));

  checks.push(item("speed","Performance","זמן תגובת שרת",durationMs<=800?100:durationMs<=1500?75:durationMs<=3000?50:20,12,`העמוד התקבל בתוך ${durationMs} אלפיות שנייה.`,"שפרו TTFB באמצעות caching ו-CDN."));
  checks.push(item("size","Performance","גודל HTML",page.body.length<=150000?100:page.body.length<=350000?70:40,8,`גודל HTML כ-${Math.round(page.body.length/1024)}KB.`,"צמצמו HTML מיותר ורכיבים כבדים."));
  checks.push(item("lazy","Performance","טעינה עצלה לתמונות",images?Math.round(lazyImages/images*100):100,6,images?`${lazyImages} מתוך ${images} תמונות מוגדרות lazy.`:"אין תמונות.","הגדירו lazy לתמונות שאינן באזור הראשון."));
  checks.push(item("dimensions","Performance","מידות תמונות",images?Math.round(sizedImages/images*100):100,5,images?`${sizedImages} מתוך ${images} תמונות כוללות מידות.`:"אין תמונות.","הגדירו width ו-height לצמצום קפיצות פריסה."));
  checks.push(item("scripts","Performance","עומס סקריפטים",scripts<=8?100:scripts<=18?65:30,5,`נמצאו ${scripts} קובצי סקריפט חיצוניים.`,"הסירו סקריפטים לא חיוניים וטענו אותם בצורה דחויה."));
  checks.push(item("visual","Performance","בסיס חוויית מובייל",viewport&&favicon?100:viewport||favicon?65:30,4,`${viewport?"viewport קיים":"viewport חסר"}; ${favicon?"favicon קיים":"favicon חסר"}.`,"הגדירו viewport, favicon וממשק רספונסיבי."));

  const seo=weighted(checks,"SEO"), geo=weighted(checks,"GEO"), aeo=weighted(checks,"AEO"), performance=weighted(checks,"Performance");
  const overall=Math.round(seo*.35+geo*.27+aeo*.25+performance*.13);
  const topKeywords=keywords(`${title} ${h1.join(" ")} ${h2.join(" ")} ${bodyText.slice(0,25000)}`);
  const topic=topKeywords.slice(0,3).join(" ")||h1[0]||title||"הנושא המרכזי";
  const contentIdeas = [
    { type:"section" as const, title:"פסקת תשובה ישירה ל-AEO", value:`${topic} הוא נושא שכדאי להסביר תחילה בתשובה קצרה וברורה, ולאחר מכן להרחיב בדוגמאות, נתונים ומקורות.`, reason:"תשובה ממוקדת מסייעת להבנה ולציטוט." },
    { type:"faq" as const, title:"אשכול שאלות מומלץ", value:`מהו ${topic}?\nלמי זה מתאים?\nאיך בוחרים נכון?\nמה היתרונות והחסרונות?`, reason:"שאלות בשפה טבעית מחזקות AEO." },
    ...(!schemaTypes.includes("Organization") ? [{ type:"schema" as const, title:"Schema ארגוני בסיסי", value:JSON.stringify({"@context":"https://schema.org","@type":"Organization","name":title.split(/[|\-–]/)[0]||"המותג","url":canonical||page.finalUrl.toString(),"sameAs":[]},null,2), reason:"ישות ברורה מסייעת למנועים להבין את המותג." }] : []),
    ...(oaiSearchBot==="blocked" ? [{ type:"robots" as const, title:"פתיחת OAI-SearchBot", value:"User-agent: OAI-SearchBot\nAllow: /", reason:"הבוט חסום כרגע." }] : [])
  ];

  return {
    url: requested.toString(), finalUrl: page.finalUrl.toString(), fetchedAt:new Date().toISOString(), durationMs, persisted:false,
    scores:{overall,seo,geo,aeo,performance},
    response:{status:page.response.status,contentType,htmlBytes:page.body.length,redirects:page.redirects},
    snapshot:{title,description,canonical,robotsMeta,lang,dir,h1,h2,wordCount,images,imagesMissingAlt,internalLinks,externalLinks,questionHeadings,answerBlocks,listCount,tableCount,schemaTypes,jsonLdErrors,scripts,lazyImages,sizedImages},
    crawlability:{robotsFound:robots.ok,sitemapFound,sitemapUrl,llmsTxtFound,googlebot,oaiSearchBot,gptBot},
    checks,contentIdeas,topKeywords
  };
}
