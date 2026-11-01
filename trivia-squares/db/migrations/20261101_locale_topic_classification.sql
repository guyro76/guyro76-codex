-- Trivia Squares - narrowly scoped six-locale topic-classification correction.
-- Applies ONLY to trivia_squares.question_mix_topic; no question/player writes.
-- IMPORTANT: review and execute in isolated SQL QA first; do not auto-apply in production.
-- Current production baseline (2026-11-01):
-- en 'Krovim Krovim · Israeli TV' => israel_politics (8 active, incorrect)
-- ar 'التكنولوجيا' => general (3 active, incorrect)
-- fr 'Gastronomie' => general (4 active, incorrect)
-- Preserve existing topic selection order, all other locale patterns, and volatility.
CREATE OR REPLACE FUNCTION trivia_squares.question_mix_topic(p_category text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $function$
 SELECT CASE
   WHEN lower(coalesce(p_category,'')) ~ 'אירוויזיון|eurovisi|евровид|يوروفي|यूरोविज' THEN 'eurovision'
   WHEN lower(coalesce(p_category,'')) ~ 'גאוגר|גיאוגר|בירות העולם|geograph|géograph|geograf|географ|الجغرافيا|جغراف|capital|capitale|столиц|عواصم العالم|ciudades' THEN 'capitals'
   WHEN lower(coalesce(p_category,'')) ~ 'קולנוע|סדרות|סדרה|טלוויז|סרט|קרובים קרובים|film|movie|television|israeli tv|cin[eé]ma|s[eé]rie|pel[ií]cula|cine|disney|кино|сериал|дисне|مسلسل|أفلام|ديزني|فريندز|friends|друзья' THEN 'tv_film'
   WHEN lower(coalesce(p_category,'')) ~ 'מוזיק|שיר|זמר|להקה|music|musique|m[uú]sica|музык|песня|موسيقى|أغنية' THEN 'music'
   WHEN lower(coalesce(p_category,'')) ~ 'היסטור|הסכמי שלום|history|histoire|historia|истори|تاريخ|معاهدات' THEN 'history'
   WHEN lower(coalesce(p_category,'')) ~ 'מדע|חלל|טכנולוג|science|scienc|technolog|наук|технолог|العلوم|التكنولوجيا|ciencia' THEN 'science'
   WHEN lower(coalesce(p_category,'')) ~ 'טבע|בעלי חיים|nature|wildlife|природ|الطبيعة|naturaleza' THEN 'nature'
   WHEN lower(coalesce(p_category,'')) ~ 'ספורט|sport|спор|رياضة|deportes' THEN 'sports'
   WHEN lower(coalesce(p_category,'')) ~ 'ישראל|כנסת|פוליטיק|israel|politic|knesset|израил|السياس' THEN 'israel_politics'
   WHEN lower(coalesce(p_category,'')) ~ 'אוכל|מאכל|מטבח|food|cuisin|cocina|gastronomie|еда|الطعام' THEN 'food'
   WHEN lower(coalesce(p_category,'')) ~ 'אמנות|ספרות|ציור|arts|literature|искусств|الفنون|arte' THEN 'arts'
   WHEN lower(coalesce(p_category,'')) ~ 'תעופה|airline|aviation|авиац|طيران' THEN 'aviation'
   WHEN lower(coalesce(p_category,'')) ~ 'מכוני|רכב|car|auto|autom[oó]vil|السيارات|автомоб' THEN 'cars'
   ELSE 'general'
 END;
$function$;
