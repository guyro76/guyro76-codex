# בדיקת עובדות – שאלות הקטגוריות החדשות (עברית)

קובץ: `src/lib/curatedHebrewQuestions.ts` · 96 שאלות · מזהים 990000–990095 · תאריך: 2026-11-02

## קטגוריות
גאוגרפיה של ישראל · גיבורי התנ״ך · ראשי ממשלת ישראל · ספרות ישראלית · מוזיקה ישראלית ועולמית · סדרות טלוויזיה · סדרות · חברים · סדרות · סיינפלד · ידע כללי.

## איך נבדק
- בודק עצמאי (סוכן נפרד שלא כתב את השאלות) בדק כל שאלה: האם התשובה המסומנת נכונה, והאם אף מסיח אינו נכון גם הוא.
- קיום כל 96 קישורי המקור נבדק דרך ה-API של ויקיפדיה.
- מגבלה: ויקיפדיה החזירה שוב ושוב 429 (הגבלת קצב), ולכן לא נקרא גוף העמוד של כל מקור. עובדות מוכרות היטב (נובל לעגנון ב-1966, הסכם השלום עם מצרים ב-1979 וכו') נבדקו מול ידע מבוסס.

## תוצאה
- כל 96 התשובות המסומנות נכונות. אין מסיח נכון.
- תוקנו:
  - 990005: "בגבולה הצפוני של תל אביב" שגוי, כי הירקון זורם בתוך העיר. הנוסח החדש: "בצפון תל אביב".
  - 990006: גבול השרון בצפון הוא נחל התנינים, לא רכס הכרמל. מקור: משרד החינוך, pop.education.gov.il.
  - 990014: "הפלישתי" תוקן ל"הפלשתי".
  - 990016, 990023, 990042, 990063: קישורי מקור שבורים הוחלפו בעמודים הקיימים: שרה, מרים הנביאה, המאהב, פאודה.
  - 990040: שם הספר המדויק הוא "מישהו לרוץ אתו".
  - 990043: השאלה נוסחה מחדש כשאלה על הסופר (קישון).
  - 990061: "הכתר הזהב" תוקן ל"כתר הזהב".
  - 990068: "הבן הבכור" שונה ל"הילד הבכור", כי לבארט אין אח.
  - 990070: "פליאונטולוג" תוקן ל"פלאונטולוג", לפי הכתיב בוויקיפדיה העברית.
  - 990075, 990077: שמות השחקנים הוחלפו לכתיב שבוויקיפדיה העברית: מאט לה-בלאנק, מת'יו פרי.
- שאלה תלוית זמן: 990032 (נתניהו כראש הממשלה בעל הכהונה המצטברת הארוכה ביותר). השיא נשבר ב-2019 ונשאר בתוקף. יש לבדוק שוב אם ישתנה.

## כלל
לא מוסיפים שאלה בלי מקור ובלי בדיקה. לא ממציאים עובדות כדי להגיע למספר.


# סבב 2 – 105 שאלות חדשות (2026-11-03)

מזהים 990096–990200. נכתבו בעקבות בקשת גיא: יותר מ-60 שאלות, ואף שאלה לא מכילה את התשובה.

## איך נבדק
- שלושה בודקים עצמאיים (סוכנים נפרדים שלא כתבו את השאלות) בדקו כל שאלה מול שני מקורות לפחות: ויקיפדיה ועוד מקור (בריטניקה, אתר רשמי, כלי תקשורת, ויקיפדיה העברית).
- נבדק גם: אין מסיח נכון, אין דליפת תשובה, עברית תקנית ושמות לפי ויקיפדיה העברית.
- בדיקה אוטומטית: מבחן הדליפה (`tests/answerLeak.test.mjs`) ומגן זמן הריצה (`src/lib/answerGuard.ts`) – אפס פגיעות. בדיקת כפילויות מול כל המאגרים ומול השרת.

## מה תוקן או הוסר לפני השחרור
- הוסרה: שאלת "הבורר" – הדמות הראשית היא ברוך אסולין (משה איבגי), ושאול מזרחי מגלם את יוסי. הטיוטה הייתה שגויה.
- 15 שאלות הוסרו כי כבר קיימות במאגר (אוגוסטוס, ארמסטרונג, וולטר וייט, המונה ליזה ועוד).
- "ירושלים של ברזל": השאלה היא על המילים (המנגינה של נעמי שמר). זהר ארגוב: "הזמיר" הוחלף, כי גם זה כינוי שלו.
- המקום הנמוך ביותר: הוסר "בישראל" מהשאלה, כי המסיחים מחוץ לישראל היו מסגירים את התשובה.
- מוצרלה: צומצם ל-DOP של קמפניה. פטה: נוסח מחדש לעברית טבעית.
- כתיב לפי ויקיפדיה העברית: תות ענח' אמון, אחנתון, פרדי מרקיורי, ביטלג'וז, אובי ואן קנובי, ה"ג ולס, זהר ארגוב.
- מסיחים שהוחלפו כי היו נכונים בחלקם: פוסום (שאלת הקואלה), שוגר גליידר (כיסנאי דואה).

## השאלות והמקורות
| מזהה | שאלה | תשובה | מקורות הבדיקה |
|---|---|---|---|
| 990096 | מהו היסוד הכימי שסימנו בטבלה המחזורית הוא Fe? | ברזל | https://en.wikipedia.org/wiki/Iron · https://www.britannica.com/science/iron-chemical-element |
| 990097 | מי ניסח את שלושת חוקי התנועה הקלאסיים? | אייזק ניוטון | https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion · https://www.britannica.com/science/Newtons-laws-of-motion |
| 990098 | מהי בקירוב מהירות האור בריק? | כ-300,000 ק"מ בשנייה | https://en.wikipedia.org/wiki/Speed_of_light · https://siunits.stuchalk.domains.unf.edu/si/definingconstantsymbol/c |
| 990099 | איזה איבר בגוף האדם מייצר את ההורמון אינסולין? | הלבלב | https://en.wikipedia.org/wiki/Insulin · https://www.britannica.com/science/pancreatic-hormone |
| 990100 | מי גילה את הפניצילין ב-1928? | אלכסנדר פלמינג | https://en.wikipedia.org/wiki/Penicillin · https://www.sciencehistory.org/historical-profile/alexander-fleming |
| 990101 | איזה סוג דם נחשב ל"תורם אוניברסלי" בעירוי של תאי דם אדומים? | O שלילי | https://en.wikipedia.org/wiki/Blood_type · https://www.redcross.org/about-us/news-and-events/news/Red-Cross-Encourages-Type-O-Negative-Blood-Donors-to-Give.html |
| 990102 | איזה כוכב לכת הוא החם ביותר במערכת השמש? | נוגה | https://en.wikipedia.org/wiki/Venus · https://guinnessworldrecords.com/world-records/64987-hottest-planet |
| 990103 | כמה כרומוזומים יש בתא גוף רגיל של אדם? | 46 | https://en.wikipedia.org/wiki/Chromosome · https://medlineplus.gov/genetics/understanding/basics/howmanychromosomes |
| 990104 | מהו היונק היחיד המסוגל לעוף באמת, ולא רק לדאות? | עטלף | https://en.wikipedia.org/wiki/Bat · https://www.britannica.com/list/5-surprising-facts-about-bats |
| 990105 | כמה לבבות יש לתמנון? | שלושה | https://en.wikipedia.org/wiki/Octopus · https://www.smithsonianmag.com/science-nature/ten-wild-facts-about-octopuses-they-have-three-hearts-big-brains-and-blue-blood-7625828/ |
| 990106 | איזה עוף נחשב לבעל החיים המהיר ביותר בעולם, בזמן צלילה? | בז נודד | https://en.wikipedia.org/wiki/Peregrine_falcon · https://guinnessworldrecords.com/world-records/70929-fastest-bird-diving |
| 990107 | איזו ציפור נבחרה ב-2008 לציפור הלאומית של ישראל? | דוכיפת | https://en.wikipedia.org/wiki/List_of_national_symbols_of_Israel · https://www.nbcnews.com/id/wbna24875880 |
| 990108 | ממה ניזונות בעיקר הפנדות הענקיות? | במבוק | https://en.wikipedia.org/wiki/Giant_panda · https://www.worldatlas.com/articles/what-do-giant-pandas-eat.html |
| 990109 | איזה בעל חיים אוסטרלי ניזון כמעט רק מעלי אקליפטוס? | קואלה | https://en.wikipedia.org/wiki/Koala · https://www.pbs.org/wnet/nature/blog/koala-fact-sheet · https://animaldiversity.org/accounts/Petauroides_volans/ |
| 990110 | כמה רגליים יש לעכביש? | שמונה | https://en.wikipedia.org/wiki/Spider · https://www.britannica.com/summary/spider-arachnid |
| 990111 | איזה פרח נבחר ב-2013 לפרח הלאומי של ישראל? | כלנית | https://he.wikipedia.org/wiki/כלנית_מצויה · https://en.wikipedia.org/wiki/List_of_national_symbols_of_Israel |
| 990112 | איזה דג נודד מהים אל הנהרות כדי להטיל ביצים, ונודע בקפיצותיו במעלה מפלים? | סלמון | https://en.wikipedia.org/wiki/Salmon · https://www.fws.gov/sites/default/files/documents/Fish-Need-to-Move-Atlantic-salmon.pdf |
| 990113 | באיזו שנה הגיע כריסטופר קולומבוס לראשונה ליבשת אמריקה? | 1492 | https://en.wikipedia.org/wiki/Voyages_of_Christopher_Columbus · https://www.britannica.com/biography/Christopher-Columbus/The-first-voyage |
| 990114 | איזו אונייה טבעה ב-1912 במסעה הראשון, לאחר שהתנגשה בקרחון? | טיטאניק | https://en.wikipedia.org/wiki/Titanic · https://www.britannica.com/event/Titanic |
| 990115 | מי היה ראש ממשלת בריטניה במרבית שנות מלחמת העולם השנייה? | וינסטון צ'רצ'יל | https://en.wikipedia.org/wiki/Winston_Churchill · https://winstonchurchill.org/the-life-of-churchill/war-leader/page/2/ |
| 990116 | היכן נחתם ב-1994 הסכם השלום בין ישראל לירדן? | מעבר הערבה | https://he.wikipedia.org/wiki/הסכם_השלום_בין_ישראל_לירדן · https://www.presidency.ucsb.edu/documents/remarks-the-signing-ceremony-for-the-israel-jordan-peace-treaty-the-border-between-israel |
| 990117 | קברו של איזה פרעה נמצא כמעט שלם בעמק המלכים ב-1922? | תות ענח' אמון | https://en.wikipedia.org/wiki/Tutankhamun · https://www.nationalgeographic.com/history/article/10-things-to-know-about-the-discovery-of-king-tuts-tomb |
| 990118 | באיזו שנה התכנס בבזל הקונגרס הציוני הראשון? | 1897 | https://en.wikipedia.org/wiki/First_Zionist_Congress · https://www.jewishvirtuallibrary.org/first-zionist-congress-and-basel-program-1897 |
| 990119 | באיזו מדינה נערכו ב-1896 המשחקים האולימפיים המודרניים הראשונים? | יוון | https://en.wikipedia.org/wiki/1896_Summer_Olympics · https://olympics.com/en/olympic-games/athens-1896 |
| 990120 | מי הייתה הספורטאית הישראלית הראשונה שזכתה במדליה אולימפית? | יעל ארד | https://he.wikipedia.org/wiki/יעל_ארד · https://israeled.org/yael-arad-wins-israels-first-olympic-medal/ |
| 990121 | מי זכה במדליית הזהב האולימפית הראשונה של ישראל? | גל פרידמן | https://en.wikipedia.org/wiki/Gal_Fridman · https://www.jta.org/archive/israelis-do-the-wave-after-windsurfer-earns-countrys-first-olympic-gold-medal |
| 990122 | מהו האורך הרשמי של ריצת מרתון? | 42.195 ק"מ | https://en.wikipedia.org/wiki/Marathon · https://www.worldathletics.org/disciplines/road/marathon |
| 990123 | מה צבע החולצה שלובש מוביל הדירוג הכללי בטור דה פראנס? | צהוב | https://en.wikipedia.org/wiki/General_classification_in_the_Tour_de_France · https://frenchentree.com/news/theyre-off-do-you-know-what-the-yellow-shirt-means |
| 990124 | איזו נבחרת זכתה בגביע העולם הראשון בכדורגל, ב-1930? | אורוגוואי | https://en.wikipedia.org/wiki/1930_FIFA_World_Cup · https://www.estadiocentenario.com.uy/en/news/article/uruguay-wins-the-1930-world-cup |
| 990125 | מי זכה בתואר אלוף העולם בשחמט ב-1972, בקרב מול בוריס ספאסקי? | בובי פישר | https://en.wikipedia.org/wiki/World_Chess_Championship_1972 · https://www.britannica.com/biography/Bobby-Fischer |
| 990126 | בסרט "מלך האריות", מה שמו של חזיר היבלות, חברו של טימון? | פומבה | https://en.wikipedia.org/wiki/Timon_and_Pumbaa · https://he.wikipedia.org/wiki/טימון_ופומבה |
| 990127 | בסרט "הקוסם מארץ עוץ" (1939), מה שמו של הכלב של דורותי? | טוטו | https://en.wikipedia.org/wiki/Toto_(Oz) · https://en.wikipedia.org/wiki/Terry_(dog) · https://www.tvinsider.com/1283209/toto-wizard-of-oz-whatever-happened-to-terry-terrier/ |
| 990128 | בטרילוגיה "שר הטבעות", מה שמו של הגמד שבחבורת הטבעת? | גימלי | https://en.wikipedia.org/wiki/Gimli_(Middle-earth) · https://tolkiengateway.net/wiki/Gimli |
| 990129 | מי ביים את הסרט "ספרות זולה" (Pulp Fiction)? | קוונטין טרנטינו | https://en.wikipedia.org/wiki/Pulp_Fiction · https://www.britannica.com/print/article/1404101 |
| 990130 | בסדרה "הסימפסונים", מה שמו של בעל תחנת הכוח שבה עובד הומר? | מר ברנס | https://en.wikipedia.org/wiki/Mr._Burns · https://simpsons.fandom.com/wiki/Charles_Montgomery_Burns |
| 990131 | מי כתב את מילות השיר "התקווה"? | נפתלי הרץ אימבר | https://en.wikipedia.org/wiki/Hatikvah · https://www.myjewishlearning.com/article/hatikvah/ |
| 990132 | באיזו להקת רוק פעל שלום חנוך באמצע שנות ה-70? | טאמוז | https://en.wikipedia.org/wiki/Tamouz_(band) · https://en.faceoffrockshow.com/post/tamouz-end-of-the-orange-season |
| 990133 | מי כתבה את השיר "הליכה לקיסריה" ("אלי, אלי")? | חנה סנש | https://en.wikipedia.org/wiki/Hannah_Szenes · https://www.ynet.co.il/articles/mobile/0,7340,L-5620354,00.html |
| 990134 | מי הוא סולן להקת "משינה"? | יובל בנאי | https://en.wikipedia.org/wiki/Mashina · https://www.jewage.org/wiki/en/Article:Yuval_Banay_-_Biography |
| 990135 | מי כתב את מילות השיר "ירושלים של ברזל"? | מאיר אריאל | https://en.wikipedia.org/wiki/Meir_Ariel · https://blogs.timesofisrael.com/jerusalem-of-iron/ |
| 990136 | איך נקראה הלהקה שליוותה את אהוד בנאי באלבום הבכורה שלו ב-1987? | הפליטים | https://en.wikipedia.org/wiki/Ehud_Banai · https://www.faceoffrockshow.com/post/ehud-banai |
| 990137 | מי הייתה הזמרת בשלישייה "החלונות הגבוהים"? | ג'וזי כץ | https://en.wikipedia.org/wiki/The_High_Windows · https://www.maariv.co.il/culture/music/article-1310747 |
| 990138 | באיזה כינוי נודע הזמר זהר ארגוב? | המלך | https://en.wikipedia.org/wiki/Zohar_Argov · https://www.posenlibrary.com/node/10647 |
| 990139 | מאיזה זרע מכינים טחינה? | שומשום | https://en.wikipedia.org/wiki/Tahini · https://www.dictionary.com/browse/tahina |
| 990140 | איזה תבלין, המופק מצלקות של פרח, נחשב לתבלין היקר בעולם? | זעפרן | https://en.wikipedia.org/wiki/Saffron · https://www.britannica.com/topic/saffron |
| 990141 | מאיזה חלב מכינים את המוצרלה המסורתית המוגנת (DOP) של חבל קמפניה שבאיטליה? | חלב תאו מים | https://en.wikipedia.org/wiki/Buffalo_mozzarella · https://www.slowfood.com/blog-and-news/mozzarella-yes-please-the-real-kind/ |
| 990142 | לפי כללי האיחוד האירופי, רק גבינה ממדינה אחת רשאית להיקרא "פטה". מאיזו מדינה? | יוון | https://en.wikipedia.org/wiki/Feta · https://www.foodnavigator.com/Article/2002/06/17/Greece-wins-cheese-battle · https://cms.law/en/gbr/legal-updates/disputed-protected-designation-of-origin-feta-cheese |
| 990143 | מאיזה צמח מפיקים טקילה? | אגבה כחולה | https://en.wikipedia.org/wiki/Tequila · https://www.diffordsguide.com/encyclopedia/991/bws/tequila-how-is-tequila-made-and-what-from |
| 990144 | מי צייר את "ליל כוכבים"? | וינסנט ואן גוך | https://en.wikipedia.org/wiki/The_Starry_Night · https://www.moma.org/explore/inside_out/2013/04/10/shedding-light-on-the-starry-night/ |
| 990145 | מי כתבה את הרומן "שירת הסירנה"? | עירית לינור | https://en.wikipedia.org/wiki/Irit_Linur · https://jewishculture.illinois.edu/irit-linur |
| 990146 | מי פיסל את פסל "דוד" המוצג בגלריה דל'אקדמיה בפירנצה? | מיכלאנג'לו | https://en.wikipedia.org/wiki/David_(Michelangelo) · https://www.italia.it/en/tuscany/florence/accademia-gallery |
| 990147 | מהו הירח הגדול ביותר במערכת השמש? | גנימד | https://en.wikipedia.org/wiki/Ganymede_(moon) · https://www.space.com/16440-ganymede-facts-about-jupiters-largest-moon.html |
| 990148 | מי היה האדם הראשון ששהה בחלל, ב-1961? | יורי גגארין | https://en.wikipedia.org/wiki/Yuri_Gagarin · https://www.space.com/11351-yuri-gagarin-1st-human-spaceflight-facts-50-years.html |
| 990149 | מי היה האסטרונאוט הישראלי הראשון? | אילן רמון | https://en.wikipedia.org/wiki/Ilan_Ramon · https://www.space.com/19433-shuttle-columbia-israel-astronaut-ilan-ramon.html |
| 990150 | מי רשם ב-1876 את הפטנט על הטלפון? | אלכסנדר גרהם בל | https://en.wikipedia.org/wiki/Alexander_Graham_Bell · https://www.history.com/this-day-in-history/march-7/alexander-graham-bell-patents-the-telephone |
| 990151 | איזו חברה רכשה ב-2013 את Waze, יישום הניווט שפותח בישראל? | גוגל | https://en.wikipedia.org/wiki/Waze · https://www.geoweeknews.com/news/google-acquires-social-mapping-app-waze |
| 990152 | מי ייסד את מיקרוסופט יחד עם פול אלן? | ביל גייטס | https://en.wikipedia.org/wiki/Microsoft · https://www.britannica.com/summary/Microsoft-Corporation |
| 990153 | באיזו שנה הוצג האייפון הראשון? | 2007 | https://en.wikipedia.org/wiki/IPhone_(1st_generation) · https://www.history.com/this-day-in-history/January-9/steve-jobs-debuts-the-iphone |
| 990154 | מהו המקום הנמוך ביותר ביבשה בכדור הארץ? | חופי ים המלח | https://en.wikipedia.org/wiki/Dead_Sea · https://www.livescience.com/planet-earth/geology/whats-earths-lowest-point-on-land |
| 990155 | איזה מבצר מימי הורדוס שוכן על צוק מעל ים המלח? | מצדה | https://en.wikipedia.org/wiki/Masada · https://whc.unesco.org/en/list/1040 |
| 990156 | באיזו עיר נמצא מקדש הבאב, שסביבו הגנים הבהאיים המדורגים? | חיפה | https://en.wikipedia.org/wiki/Shrine_of_the_B%C3%A1b · https://news.bahai.org/story/1365 |
| 990157 | כמה ימים ירד הגשם בסיפור המבול לפי ספר בראשית? | 40 | https://en.wikipedia.org/wiki/Genesis_flood_narrative · https://biblehub.com/texts/genesis/7-12.htm |
| 990158 | על איזה הר קיבל משה את לוחות הברית? | הר סיני | https://en.wikipedia.org/wiki/Mount_Sinai · https://mail.biblehub.com/exodus/31-18.htm |
| 990159 | מי היה בנו הבכור של יעקב? | ראובן | https://en.wikipedia.org/wiki/Reuben_(son_of_Jacob) · https://biblehub.com/multi/genesis/49-3.htm |
| 990160 | מי היה הנשיא הראשון של מדינת ישראל? | חיים ויצמן | https://en.wikipedia.org/wiki/Chaim_Weizmann · https://posenlibrary.com/node/1335 |
| 990161 | באיזו שנה התרחשה מלחמת ששת הימים? | 1967 | https://en.wikipedia.org/wiki/Six-Day_War · https://www.Britannica.Com/event/Six-Day-War |
| 990162 | איזה שם ניתן לאחר מעשה למבצע חילוץ החטופים באנטבה ב-1976? | מבצע יונתן | https://en.wikipedia.org/wiki/Operation_Entebbe · https://www.nli.org.il/en/discover/history/events-israeli-history/operation-entebbe |
| 990163 | איזה מבצע העלה ב-1991 כ-14,000 יהודים מאתיופיה לישראל בתוך כ-36 שעות? | מבצע שלמה | https://en.wikipedia.org/wiki/Operation_Solomon · https://www.worldjewishcongress.org/en/news/this-week-in-jewish-history--operation-solomon-israel-airlifts-14000-ethiopian-jews-to-safety-in-unparalleled-mission-5-3-2020 |
| 990164 | כמה כלים יש לכל שחקן בתחילת משחק שחמט? | 16 | https://en.wikipedia.org/wiki/Chess · https://www.ebsco.com/research-starters/sports-and-leisure/chess/ |
| 990165 | מהו המטבע הרשמי של יפן? | ין | https://en.wikipedia.org/wiki/Japanese_yen · https://equalsmoney.com/currencies/majors/jpy |
| 990166 | באיזו שפה כתוב רובו של התלמוד הבבלי? | ארמית | https://en.wikipedia.org/wiki/Babylonian_Talmud · https://www.britannica.com/topic/Talmud/Early-compilations |
| 990167 | באיזה כלי נגינה התפרסם יאשה חפץ? | כינור | https://en.wikipedia.org/wiki/Jascha_Heifetz · https://www.britannica.com/biography/Jascha-Heifetz |
| 990168 | בסרט "מלתעות" (1975), איזה בעל חיים מטיל אימה על חוף הים? | כריש | https://en.wikipedia.org/wiki/Jaws_(film) · https://Filmsite.org/jaws1975.html |
| 990169 | מי מגלם את קפטן ג'ק ספארו בסדרת הסרטים "שודדי הקאריביים"? | ג'וני דפ | https://en.wikipedia.org/wiki/Jack_Sparrow · https://www.britannica.com/print/article/906748 |
| 990170 | בסדרה "מסע בין כוכבים" המקורית, מה שמה של החללית של קפטן קירק? | אנטרפרייז | https://en.wikipedia.org/wiki/USS_Enterprise_(NCC-1701) · https://tv.apple.com/us/show/star-trek-the-original-series/umc.cmc.5howwgk962prd0y3yi928rx5a |
| 990171 | בסדרת הסרטים "הארי פוטר", לאיזה בית בהוגוורטס משתייך הארי? | גריפינדור | https://www.hp-lexicon.org/?p=10500 · https://www.audible.com/blog/article-harry-potter-gryffindor-house-explainer |
| 990172 | מה היה שמו הפרטי של פרדי מרקיורי, סולן להקת קווין, בלידתו? | פארוק | https://en.wikipedia.org/wiki/Freddie_Mercury · https://www.britannica.com/biography/Freddie-Mercury |
| 990173 | איזה זמר כונה "מלך הפופ"? | מייקל ג'קסון | https://en.wikipedia.org/wiki/Michael_Jackson · https://www.britannica.com/biography/Michael-Jackson |
| 990174 | מהו המרכיב העיקרי בפלאפל הישראלי? | גרגרי חומוס | https://en.wikipedia.org/wiki/Falafel · https://www.chowhound.com/1702705/difference-falafel-vs-taammeya/ |
| 990175 | מאיזה חומר גלם מפיקים שוקולד? | פולי קקאו | https://en.wikipedia.org/wiki/Chocolate · https://www.britannica.com/summary/chocolate |
| 990176 | באיזו יחידה מודדים התנגדות חשמלית? | אוהם | https://en.wikipedia.org/wiki/Ohm · https://www.nist.gov/glossary-term/28441 |
| 990177 | איזו מתכת נמצאת במצב נוזלי בטמפרטורת החדר? | כספית | https://en.wikipedia.org/wiki/Mercury_(element) · https://royalsociety.org.nz/150th-anniversary/ask-me-questions/is-mercury-a-liquid-or-a-metal-and-why |
| 990178 | מי ניסח את תורת היחסות הכללית? | אלברט איינשטיין | https://en.wikipedia.org/wiki/General_relativity · https://www.britannica.com/science/general-relativity |
| 990179 | מהו הכוכב הבהיר ביותר בשמי הלילה? | סיריוס | https://en.wikipedia.org/wiki/Sirius · https://www.space.com/21702-sirius-brightest-star.html |
| 990180 | כמה זוגות כנפיים יש לדבורת הדבש? | 2 | https://www.honeybeesuite.com/diaphanous-wings-they-soar/ · https://blythewoodbeecompany.com/blogs/news/honey-bee-wings |
| 990181 | האורקה, המכונה "לווייתן קטלן", היא המין הגדול ביותר באיזו משפחה? | הדולפיניים | https://en.wikipedia.org/wiki/Orca · https://www.guinnessworldrecords.com/world-records/360562-largest-dolphin-species |
| 990182 | איזה בעל חיים בעל קרניים ארוכות ומעוקלות נפוץ במצוקי עין גדי? | יעל נובי | https://en.wikipedia.org/wiki/Nubian_ibex · https://jewishvirtuallibrary.org/jsource/Society_&_Culture/eingedinatlpark.html |
| 990183 | מי היה ראש הממשלה הראשון של ישראל שנולד בארץ ישראל? | יצחק רבין | https://en.wikipedia.org/wiki/Yitzhak_Rabin · https://www.britannica.com/summary/Yitzhak-Rabin |
| 990184 | באיזו שנה התפרקה ברית המועצות? | 1991 | https://en.wikipedia.org/wiki/Dissolution_of_the_Soviet_Union · https://www.britannica.com/facts/the-collapse-of-the-Soviet-Union |
| 990185 | איזו עיר רומית נקברה ב-79 לספירה תחת אפר הר הווזוב? | פומפיי | https://en.wikipedia.org/wiki/Pompeii · https://britannica.com/question/Why-was-Pompeii-destroyed |
| 990186 | מי כתב את הספר "מדינת היהודים" (1896)? | בנימין זאב הרצל | https://en.wikipedia.org/wiki/Der_Judenstaat · https://germanhistorydocs.org/en/wilhelmine-germany-and-the-first-world-war-1890-1918/theodor-herzl-the-jewish-state-1896 |
| 990187 | באיזו עיר נערכו המשחקים האולימפיים של 1972, שבהם נרצחו 11 ספורטאים ומאמנים ישראלים? | מינכן | https://en.wikipedia.org/wiki/Munich_massacre · https://www.nbcnews.com/news/photo/munich-olympics-massacre-remembered-40-years-later-flna980263 |
| 990188 | מי קבע ב-2009 את שיא העולם בריצת 100 מטר, 9.58 שניות? | יוסיין בולט | https://en.wikipedia.org/wiki/Usain_Bolt · https://worldathletics.org/news/news/bolt-again-958-world-record-in-berlin-updat |
| 990189 | באיזה ענף זכה ארטיום דולגופיאט במדליית זהב אולימפית בטוקיו? | התעמלות מכשירים | https://en.wikipedia.org/wiki/Artem_Dolgopyat · https://jpost.com/international/israeli-artistic-gymnast-wins-olympic-gold-medal-at-mens-floor-finals-675517 |
| 990190 | כמה טבעות מופיעות בסמל האולימפי? | חמש | https://en.wikipedia.org/wiki/Olympic_symbols · https://olympics.com/ioc/olympic-rings |
| 990191 | בסדרת סרטי "מלחמת הכוכבים", מיהו אביו של לוק סקייווקר? | דארת' ויידר | https://britannica.com:443/topic/Darth-Vader · https://en.wikipedia.org/wiki/Darth_Vader |
| 990192 | בסרט "מוצאים את נמו", מה שמה של הדגה שסובלת מאובדן זיכרון לטווח קצר? | דורי | https://en.wikipedia.org/wiki/Dory_(Finding_Nemo) · https://www.filminquiry.com/?p=31103 |
| 990193 | בגרסה האמריקאית של "המשרד", מי המנהל האזורי של הסניף בעונות הראשונות? | מייקל סקוט | https://en.wikipedia.org/wiki/Michael_Scott_(The_Office) · https://www.britannica.com/EBchecked/topic/1271530/The-Office |
| 990194 | מי כתב את מילות "שיר לשלום"? | יעקב רוטבליט | https://en.wikipedia.org/wiki/Shir_LaShalom · https://www.maariv.co.il/culture/music/article-1172475 |
| 990195 | מי הלחין את השיר "אני ואתה" שכתב אריק איינשטיין? | מיקי גבריאלוב | https://www.ice.co.il/culture/news/article/912939 · https://www.timesofisrael.com/arik-einstein-six-essential-songs/ |
| 990196 | מאיזו עיר באיטליה מגיעה במקור הפיצה מרגריטה? | נאפולי | https://en.wikipedia.org/wiki/Pizza_Margherita · https://www.nationalgeographic.com/history/history-magazine/article/pizza-margherita-may-be-fit-for-a-queen-but-was-it-named-after-one |
| 990197 | איזה ירק הוא המרכיב העיקרי בבאבא גנוש? | חציל | https://en.wikipedia.org/wiki/Baba_ghanoush · https://britannica.com/topic/baba-ghanoush |
| 990198 | מי כתב את הרומן "מאה שנים של בדידות"? | גבריאל גרסיה מרקס | https://en.wikipedia.org/wiki/One_Hundred_Years_of_Solitude · https://www.history.com/this-day-in-history/may-30/one-hundred-years-of-solitude-is-published |
| 990199 | איזה צייר יצר את "גרניקה"? | פבלו פיקאסו | https://en.wikipedia.org/wiki/Guernica_(Picasso) · https://guernica.museoreinasofia.es/en |
| 990200 | מי כתב את הרומן "1984"? | ג'ורג' אורוול | https://www.britannica.com/topic/Nineteen-Eighty-four · https://en.wikipedia.org/wiki/Nineteen_Eighty-Four |
