-- Source-verified original Hebrew Disney quiz questions.
-- Sources checked directly against official Disney movie pages on 2026-10-30.
-- Run only in isolated trivia_squares schema, preserve all existing player data.
-- Idempotent by normalized exact question; do not refresh or duplicate existing rows.
begin;
lock table trivia_squares.questions in share row exclusive mode;
with source as (
 select e.ordinality as ord, e.item->>'question' as question,
 e.item->'answers' as answers,
 (e.item->>'correct_index')::integer as correct_index,
 e.item->>'source_url' as source_url,
 e.item->>'source_key' as source_key,
 e.item->>'category' as category,
 (e.item->>'difficulty')::integer as difficulty
 from jsonb_array_elements('[{"question":"מה שמו של אייל הצפון שמלווה את קריסטוף בסרט ״לשבור את הקרח״?","answers":["מקסימוס","סוון","פסקל","סימבה"],"correct_index":1,"source_url":"https://movies.disney.com/frozen","source_key":"disney_frozen","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"איך קוראים לאחותה של אנה בסרט ״לשבור את הקרח״?","answers":["רפונזל","מרידה","אלזה","מואנה"],"correct_index":2,"source_url":"https://movies.disney.com/frozen","source_key":"disney_frozen","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מה שמו של איש השלג בסרט ״לשבור את הקרח״?","answers":["סוון","קריסטוף","הנס","אולף"],"correct_index":3,"source_url":"https://movies.disney.com/frozen","source_key":"disney_frozen","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"באיזו ממלכה מתרחשת עלילת הסרט ״לשבור את הקרח״?","answers":["ארנדל","אגראבה","קורונה","אטלנטיקה"],"correct_index":0,"source_url":"https://movies.disney.com/frozen","source_key":"disney_frozen","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מה שמו של הזיקית שמלווה את רפונזל בסרט ״פלונטר״?","answers":["אבו","פסקל","סבסטיאן","מקסימוס"],"correct_index":1,"source_url":"https://movies.disney.com/tangled","source_key":"disney_tangled","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"איך נקרא הגנב שמגלה את מגדלה של רפונזל בסרט ״פלונטר״?","answers":["אלדין","קריסטוף","פלין ריידר","לי שאנג"],"correct_index":2,"source_url":"https://movies.disney.com/tangled","source_key":"disney_tangled","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מה שמו של הסוס שרודף אחרי פלין ריידר בסרט ״פלונטר״?","answers":["מקסימוס","סוון","חאן","פיליפ"],"correct_index":0,"source_url":"https://movies.disney.com/tangled","source_key":"disney_tangled","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מי גרה במגדל בעלת שיער הזהב הארוך בסרט ״פלונטר״?","answers":["אלזה","אריאל","מואנה","רפונזל"],"correct_index":3,"source_url":"https://movies.disney.com/tangled","source_key":"disney_tangled","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"למי ממשפחת מדריגל אין כוח קסם בסרט ״אנקאנטו״?","answers":["איזבלה","לואיזה","מיראבל","דולורס"],"correct_index":2,"source_url":"https://movies.disney.com/encanto","source_key":"disney_encanto","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"באיזו מדינה מתרחשת עלילת סרט דיסני ״אנקאנטו״?","answers":["מקסיקו","קולומביה","פרו","ברזיל"],"correct_index":1,"source_url":"https://movies.disney.com/encanto","source_key":"disney_encanto","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מהו שם המשפחה המרכזית בסרט דיסני ״אנקאנטו״?","answers":["מדריגל","מנדס","מונטויה","מירנדה"],"correct_index":0,"source_url":"https://movies.disney.com/encanto","source_key":"disney_encanto","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מי כתב את השירים המקוריים לסרט דיסני ״אנקאנטו״?","answers":["אלן מנקן","רנדי ניומן","פיל קולינס","לין-מנואל מירנדה"],"correct_index":3,"source_url":"https://movies.disney.com/encanto","source_key":"disney_encanto","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מה שמו של דודו של סימבה שמתכנן לתפוס את כס המלוכה בסרט ״מלך האריות״?","answers":["טימון","פומבה","סקאר","זאזו"],"correct_index":2,"source_url":"https://movies.disney.com/the-lion-king","source_key":"disney_lionking","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מי הוא אביו של סימבה בסרט האנימציה ״מלך האריות״?","answers":["רפיקי","מופאסה","סקאר","טימון"],"correct_index":1,"source_url":"https://movies.disney.com/the-lion-king","source_key":"disney_lionking","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מהו שמה של הנסיכה בסרט האנימציה ״אלאדין״ של דיסני?","answers":["בל","אריאל","טיאנה","יסמין"],"correct_index":3,"source_url":"https://movies.disney.com/aladdin","source_key":"disney_aladdin","category":"קולנוע · סרטי דיסני","difficulty":2},{"question":"מי דיבב את הג׳יני בגרסה האנגלית המקורית של ״אלאדין״ משנת 1992?","answers":["רובין ויליאמס","טום הנקס","אדי מרפי","בילי קריסטל"],"correct_index":0,"source_url":"https://movies.disney.com/aladdin","source_key":"disney_aladdin","category":"קולנוע · סרטי דיסני","difficulty":2}]'::jsonb) with ordinality as e(item,ordinality)
), eligible as (
 select * from source s where not exists (
  select 1 from trivia_squares.questions q
  where q.locale='he' and lower(btrim(q.question))=lower(btrim(s.question))
 )
), next_id as (
 select coalesce(max(id),0) as last_id from trivia_squares.questions
), added as (
 insert into trivia_squares.questions(id,category,difficulty,question,answers,correct_index,active,locale)
 select n.last_id+row_number() over (order by e.ord),e.category,e.difficulty,e.question,
  e.answers,e.correct_index,true,'he'
 from eligible e cross join next_id n order by e.ord
 returning id,question
), audited as (
 insert into trivia_squares.question_provenance(question_id,locale,topic,source_key,source_url,verified_on,time_sensitive)
 select a.id,'he','disney',s.source_key,s.source_url,date '2026-10-30',false
 from added a join source s on s.question=a.question
 returning question_id
)
select (select count(*) from added) as added_he_disney,
 (select count(*) from audited) as provenance_rows;
commit;
