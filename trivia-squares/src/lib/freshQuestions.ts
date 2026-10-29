// Pre-written, non-arithmetic question expansion reserves for local unranked play.
// All facts are stable general knowledge; no runtime AI generation and no paid APIs.
export type SeedQuestion={locale:'he'|'en';id:number;category:string;text:string;answers:string[];correct:number;difficulty:number};
export const freshLocalQuestionReserve:SeedQuestion[]=[
  {
    "locale": "he",
    "id": 90000,
    "category": "עולם וטבע",
    "text": "באיזו מדינה נמצא הפארק הלאומי ילוסטון?",
    "answers": [
      "קנדה",
      "ארצות הברית",
      "איסלנד",
      "ניו זילנד"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90001,
    "category": "עולם וטבע",
    "text": "באיזו מדינה נמצא אתר העתיקות פטרה?",
    "answers": [
      "ירדן",
      "יוון",
      "מצרים",
      "טורקיה"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90002,
    "category": "עולם וטבע",
    "text": "באיזו יבשת נמצאת מדינת צ'ילה?",
    "answers": [
      "אירופה",
      "אפריקה",
      "אסיה",
      "דרום אמריקה"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90003,
    "category": "עולם וטבע",
    "text": "איזה אוקיינוס נמצא ממזרח לאפריקה?",
    "answers": [
      "האוקיינוס האטלנטי",
      "האוקיינוס השקט",
      "האוקיינוס ההודי",
      "אוקיינוס הקרח הצפוני"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90004,
    "category": "עולם וטבע",
    "text": "איזו עיר מכונה לעיתים התפוח הגדול?",
    "answers": [
      "לונדון",
      "ניו יורק",
      "שיקגו",
      "טורונטו"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90005,
    "category": "עולם וטבע",
    "text": "באיזו מדינה נמצא הר פוג'י?",
    "answers": [
      "יפן",
      "סין",
      "נפאל",
      "הודו"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90006,
    "category": "עולם וטבע",
    "text": "באיזו מדינה נמצאת העיר ונציה?",
    "answers": [
      "צרפת",
      "ספרד",
      "פורטוגל",
      "איטליה"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90007,
    "category": "עולם וטבע",
    "text": "איזה ים מפריד בין אירופה לאפריקה באזור גיברלטר?",
    "answers": [
      "הים השחור",
      "הים הבלטי",
      "הים התיכון",
      "הים האדום"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90008,
    "category": "מדע וטבע",
    "text": "איזה בעל חיים ידוע בבניית סכרים בנחלים?",
    "answers": [
      "לוטרה",
      "בונה",
      "דביבון",
      "נמייה"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90009,
    "category": "מדע וטבע",
    "text": "איזה בעל חיים נחשב לעוף הגדול ביותר שחי כיום?",
    "answers": [
      "יען",
      "נשר",
      "פינגווין",
      "טווס"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90010,
    "category": "מדע וטבע",
    "text": "מה שמו של תהליך הפיכת זחל לפרפר?",
    "answers": [
      "התאדות",
      "נביטה",
      "האבקה",
      "גלגול"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90011,
    "category": "מדע וטבע",
    "text": "איזה איבר בגוף האדם אחראי בעיקר לסינון הדם וליצירת שתן?",
    "answers": [
      "לב",
      "קיבה",
      "כליות",
      "טחול"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90012,
    "category": "מדע וטבע",
    "text": "איזה כוכב לכת מכונה כוכב הלכת האדום?",
    "answers": [
      "נוגה",
      "מאדים",
      "שבתאי",
      "צדק"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90013,
    "category": "מדע וטבע",
    "text": "איזה חומר נותן לצמחים ירוקים את צבעם?",
    "answers": [
      "כלורופיל",
      "המוגלובין",
      "מלנין",
      "קולגן"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90014,
    "category": "מדע וטבע",
    "text": "איזו חיה היא היונק הימי הגדול ביותר?",
    "answers": [
      "דולפין",
      "כלב ים",
      "לווייתן קטלן",
      "לווייתן כחול"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90015,
    "category": "מדע וטבע",
    "text": "איך נקראת שכבת הקרח הגדולה שמכסה חלקים מיבשות?",
    "answers": [
      "דיונה",
      "שונית",
      "קרחון יבשתי",
      "סוואנה"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90016,
    "category": "היסטוריה ותרבות",
    "text": "מי הובילה את המסע החלוצי לחקר הרדיואקטיביות וזכתה בשני פרסי נובל?",
    "answers": [
      "עדה לאבלייס",
      "מארי קירי",
      "רוזלינד פרנקלין",
      "ג'יין גודול"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90017,
    "category": "היסטוריה ותרבות",
    "text": "באיזו מדינה פעלו לוחמי הסמוראים?",
    "answers": [
      "יפן",
      "איטליה",
      "אינדונזיה",
      "מקסיקו"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90018,
    "category": "היסטוריה ותרבות",
    "text": "איזה עם עתיק בנה את העיר צ'יצ'ן איצה?",
    "answers": [
      "האינקה",
      "הרומאים",
      "הוויקינגים",
      "המאיה"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90019,
    "category": "היסטוריה ותרבות",
    "text": "מי היה מנהיג התנועה לעצמאות הודו והטיף להתנגדות לא אלימה?",
    "answers": [
      "נלסון מנדלה",
      "מרטין לותר קינג",
      "מהטמה גנדי",
      "וינסטון צ'רצ'יל"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90020,
    "category": "היסטוריה ותרבות",
    "text": "באיזו עיר נמצאת האקרופוליס המפורסמת?",
    "answers": [
      "רומא",
      "אתונה",
      "קהיר",
      "ליסבון"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90021,
    "category": "היסטוריה ותרבות",
    "text": "איזו ציוויליזציה עתיקה בנתה את הקולוסיאום?",
    "answers": [
      "הרומאים",
      "הפרסים",
      "האצטקים",
      "המצרים"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90022,
    "category": "קולנוע",
    "text": "איזה סרט של פיקסאר עוסק ברגשות של ילדה בשם ריילי?",
    "answers": [
      "אמיצה",
      "קוקו",
      "נשמה",
      "הקול בראש"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90023,
    "category": "קולנוע",
    "text": "איזה שחקן מגלם את קפטן אמריקה בסרטי מארוול הראשונים?",
    "answers": [
      "כריס המסוורת'",
      "רוברט דאוני ג'וניור",
      "כריס אוונס",
      "פול ראד"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90024,
    "category": "קולנוע",
    "text": "איזה יצור מופיע במרכז סדרת סרטי קונג פו פנדה?",
    "answers": [
      "נמר",
      "פנדה",
      "דוב קוטב",
      "קואלה"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90025,
    "category": "קולנוע",
    "text": "מה שמו של חברו הרובוט של וול-אי בסרט וול-אי?",
    "answers": [
      "איב",
      "באז",
      "רמי",
      "אולף"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90026,
    "category": "קולנוע",
    "text": "באיזה סרט אנימציה מופיע השיר You're Welcome?",
    "answers": [
      "לשבור את הקרח",
      "שרק",
      "מפלצות בע\"מ",
      "מואנה"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90027,
    "category": "קולנוע",
    "text": "איזה במאי מזוהה עם הסרט המספריים של אדוארד?",
    "answers": [
      "סטיבן ספילברג",
      "כריסטופר נולאן",
      "טים ברטון",
      "ג'יימס קמרון"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90028,
    "category": "סדרות",
    "text": "איזו סדרה מתרחשת בעיירה הבדיונית הוקינס?",
    "answers": [
      "המשרד",
      "דברים מוזרים",
      "חברים",
      "סמוך על סול"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90029,
    "category": "סדרות",
    "text": "מה שמה של אחותו הקטנה של בלואי?",
    "answers": [
      "בינגו",
      "מאפין",
      "צ'ילי",
      "קוקו"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90030,
    "category": "סדרות",
    "text": "באיזו סדרה מצוירת מופיע הומר סימפסון?",
    "answers": [
      "גריפין",
      "סאות' פארק",
      "ריק ומורטי",
      "משפחת סימפסון"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90031,
    "category": "סדרות",
    "text": "מהו שם המשפחה של הדמויות ברידג'רטון?",
    "answers": [
      "ביירס",
      "סופראנו",
      "ברידג'רטון",
      "אדמס"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90032,
    "category": "סדרות",
    "text": "איזה גיבור הוא האווטאר בסדרה כשף האוויר האחרון?",
    "answers": [
      "זוקו",
      "אנג",
      "סוקה",
      "איירו"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90033,
    "category": "סדרות",
    "text": "באיזו סדרת טלוויזיה מופיעה משפחת רוי?",
    "answers": [
      "יורשים",
      "הכתר",
      "המשרד",
      "שרלוק"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90034,
    "category": "מוזיקה",
    "text": "באיזו להקה היה הסולן קורט קוביין?",
    "answers": [
      "קולדפליי",
      "גרין דיי",
      "רדיוהד",
      "נירוונה"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90035,
    "category": "מוזיקה",
    "text": "איזה כלי נגינה מזוהה עם לואי ארמסטרונג?",
    "answers": [
      "כינור",
      "נבל",
      "חצוצרה",
      "פסנתר"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90036,
    "category": "מוזיקה",
    "text": "מי הוציא את האלבום Purple Rain?",
    "answers": [
      "מייקל ג'קסון",
      "פרינס",
      "דיוויד בואי",
      "אלטון ג'ון"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90037,
    "category": "מוזיקה",
    "text": "באיזו להקה התפרסם סטינג?",
    "answers": [
      "פוליס",
      "קווין",
      "U2",
      "אואזיס"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90038,
    "category": "מוזיקה",
    "text": "מי שרה את Rolling in the Deep?",
    "answers": [
      "ריהאנה",
      "ליידי גאגא",
      "שר",
      "אדל"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90039,
    "category": "מוזיקה",
    "text": "איזו להקה הוציאה את האלבום Abbey Road?",
    "answers": [
      "קווין",
      "פינק פלויד",
      "הביטלס",
      "הרולינג סטונס"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90040,
    "category": "ספורט",
    "text": "איזה ענף ספורט כולל את תחרות הטור דה פראנס?",
    "answers": [
      "ריצה",
      "רכיבת אופניים",
      "שחייה",
      "שיט"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90041,
    "category": "ספורט",
    "text": "באיזה ענף ספורט משתמשים במונח הום ראן?",
    "answers": [
      "בייסבול",
      "כדורסל",
      "טניס",
      "כדוריד"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90042,
    "category": "ספורט",
    "text": "איזו מדינה זכתה בגביע העולם בכדורגל בשנת 2014?",
    "answers": [
      "ברזיל",
      "ארגנטינה",
      "צרפת",
      "גרמניה"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90043,
    "category": "ספורט",
    "text": "באיזה ספורט מתחרים בווימבלדון?",
    "answers": [
      "גולף",
      "קריקט",
      "טניס",
      "רוגבי"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90044,
    "category": "אוכל ותרבות",
    "text": "איזה פרי הוא המרכיב העיקרי בגוואקמולי?",
    "answers": [
      "מנגו",
      "אבוקדו",
      "אננס",
      "תפוח"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90045,
    "category": "אוכל ותרבות",
    "text": "איזה סוג קטנייה משמש להכנת פלאפל מסורתי בישראל?",
    "answers": [
      "חומוס",
      "אפונה ירוקה",
      "שעועית אדומה",
      "פול סויה"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90046,
    "category": "אוכל ותרבות",
    "text": "עם איזו מדינה מזוהה המאכל פאייה?",
    "answers": [
      "איטליה",
      "גרמניה",
      "יפן",
      "ספרד"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90047,
    "category": "אוכל ותרבות",
    "text": "איזה משקה מיוצר בדרך כלל מעלי צמח הקמיליה הסינית?",
    "answers": [
      "קקאו",
      "מיץ ענבים",
      "תה",
      "חלב שיבולת שועל"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90048,
    "category": "ישראל",
    "text": "באיזו עיר נמצא התיאטרון הלאומי הבימה?",
    "answers": [
      "ירושלים",
      "תל אביב",
      "חיפה",
      "אשדוד"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "he",
    "id": 90049,
    "category": "ישראל",
    "text": "באיזו עיר הוקם מכון ויצמן למדע?",
    "answers": [
      "רחובות",
      "חולון",
      "אשקלון",
      "הרצליה"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "he",
    "id": 90050,
    "category": "ישראל",
    "text": "איזו ימה בצפון ישראל היא מקור מים מתוקים?",
    "answers": [
      "ים המלח",
      "הים התיכון",
      "ים סוף",
      "הכנרת"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "he",
    "id": 90051,
    "category": "ישראל",
    "text": "איזה חג יהודי מציין את יציאת מצרים?",
    "answers": [
      "סוכות",
      "חנוכה",
      "פסח",
      "שבועות"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90052,
    "category": "World travel",
    "text": "Which country is home to Yellowstone National Park?",
    "answers": [
      "Canada",
      "United States",
      "Iceland",
      "New Zealand"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90053,
    "category": "World travel",
    "text": "Which country is home to the ancient city of Petra?",
    "answers": [
      "Jordan",
      "Greece",
      "Egypt",
      "Turkey"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90054,
    "category": "World travel",
    "text": "Which continent is Chile located on?",
    "answers": [
      "Europe",
      "Africa",
      "Asia",
      "South America"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90055,
    "category": "World travel",
    "text": "Which ocean is east of Africa?",
    "answers": [
      "Atlantic Ocean",
      "Pacific Ocean",
      "Indian Ocean",
      "Arctic Ocean"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90056,
    "category": "World travel",
    "text": "Which city is nicknamed the Big Apple?",
    "answers": [
      "London",
      "New York City",
      "Chicago",
      "Toronto"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90057,
    "category": "World travel",
    "text": "Which country is Mount Fuji in?",
    "answers": [
      "Japan",
      "China",
      "Nepal",
      "India"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90058,
    "category": "World travel",
    "text": "Which country is Venice in?",
    "answers": [
      "France",
      "Spain",
      "Portugal",
      "Italy"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90059,
    "category": "World travel",
    "text": "Which sea lies between much of southern Europe and northern Africa?",
    "answers": [
      "Black Sea",
      "Baltic Sea",
      "Mediterranean Sea",
      "Red Sea"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90060,
    "category": "Science and nature",
    "text": "Which animal is famous for building dams in streams?",
    "answers": [
      "Otter",
      "Beaver",
      "Raccoon",
      "Mongoose"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90061,
    "category": "Science and nature",
    "text": "What is the largest living species of bird?",
    "answers": [
      "Ostrich",
      "Eagle",
      "Penguin",
      "Peacock"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90062,
    "category": "Science and nature",
    "text": "What is the process called when a caterpillar becomes a butterfly?",
    "answers": [
      "Evaporation",
      "Germination",
      "Pollination",
      "Metamorphosis"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90063,
    "category": "Science and nature",
    "text": "Which organs filter blood and produce urine?",
    "answers": [
      "Heart",
      "Stomach",
      "Kidneys",
      "Spleen"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90064,
    "category": "Science and nature",
    "text": "Which planet is known as the Red Planet?",
    "answers": [
      "Venus",
      "Mars",
      "Saturn",
      "Jupiter"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90065,
    "category": "Science and nature",
    "text": "Which pigment makes most green leaves appear green?",
    "answers": [
      "Chlorophyll",
      "Haemoglobin",
      "Melanin",
      "Collagen"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90066,
    "category": "Science and nature",
    "text": "What is the largest animal alive today?",
    "answers": [
      "Dolphin",
      "Seal",
      "Orca",
      "Blue whale"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90067,
    "category": "Science and nature",
    "text": "What is the name for a huge mass of ice that flows over land?",
    "answers": [
      "Dune",
      "Reef",
      "Glacier",
      "Savanna"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90068,
    "category": "History and culture",
    "text": "Which scientist won Nobel Prizes in both Physics and Chemistry?",
    "answers": [
      "Ada Lovelace",
      "Marie Curie",
      "Rosalind Franklin",
      "Jane Goodall"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90069,
    "category": "History and culture",
    "text": "In which country did samurai warriors traditionally serve?",
    "answers": [
      "Japan",
      "Italy",
      "Indonesia",
      "Mexico"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90070,
    "category": "History and culture",
    "text": "Which ancient civilisation built Chichén Itzá?",
    "answers": [
      "Inca",
      "Roman",
      "Viking",
      "Maya"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90071,
    "category": "History and culture",
    "text": "Who led India's independence movement and advocated nonviolent resistance?",
    "answers": [
      "Nelson Mandela",
      "Martin Luther King Jr.",
      "Mahatma Gandhi",
      "Winston Churchill"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90072,
    "category": "History and culture",
    "text": "In which city can visitors see the Acropolis?",
    "answers": [
      "Rome",
      "Athens",
      "Cairo",
      "Lisbon"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90073,
    "category": "History and culture",
    "text": "Which ancient civilisation built the Colosseum?",
    "answers": [
      "Romans",
      "Persians",
      "Aztecs",
      "Egyptians"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90074,
    "category": "Movies",
    "text": "Which Pixar film is about a girl named Riley and her emotions?",
    "answers": [
      "Brave",
      "Coco",
      "Soul",
      "Inside Out"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90075,
    "category": "Movies",
    "text": "Which actor first played Captain America in the Marvel Cinematic Universe?",
    "answers": [
      "Chris Hemsworth",
      "Robert Downey Jr.",
      "Chris Evans",
      "Paul Rudd"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90076,
    "category": "Movies",
    "text": "Which animal stars in the Kung Fu Panda movies?",
    "answers": [
      "Tiger",
      "Panda",
      "Polar bear",
      "Koala"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90077,
    "category": "Movies",
    "text": "What is the name of WALL-E's robot companion?",
    "answers": [
      "EVE",
      "Buzz",
      "Remy",
      "Olaf"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90078,
    "category": "Movies",
    "text": "Which animated movie features the song You're Welcome?",
    "answers": [
      "Frozen",
      "Shrek",
      "Monsters, Inc.",
      "Moana"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90079,
    "category": "Movies",
    "text": "Who directed Edward Scissorhands?",
    "answers": [
      "Steven Spielberg",
      "Christopher Nolan",
      "Tim Burton",
      "James Cameron"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90080,
    "category": "Television",
    "text": "Which TV series is set in the fictional town of Hawkins?",
    "answers": [
      "The Office",
      "Stranger Things",
      "Friends",
      "Better Call Saul"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90081,
    "category": "Television",
    "text": "What is the name of Bluey's younger sister?",
    "answers": [
      "Bingo",
      "Muffin",
      "Chilli",
      "Coco"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90082,
    "category": "Television",
    "text": "Which animated TV series features Homer Simpson?",
    "answers": [
      "Family Guy",
      "South Park",
      "Rick and Morty",
      "The Simpsons"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90083,
    "category": "Television",
    "text": "What is the family name at the centre of Bridgerton?",
    "answers": [
      "Byers",
      "Soprano",
      "Bridgerton",
      "Addams"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90084,
    "category": "Television",
    "text": "Which hero is the Avatar in The Last Airbender?",
    "answers": [
      "Zuko",
      "Aang",
      "Sokka",
      "Iroh"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90085,
    "category": "Television",
    "text": "Which TV series features the Roy family?",
    "answers": [
      "Succession",
      "The Crown",
      "The Office",
      "Sherlock"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90086,
    "category": "World music",
    "text": "Which band had Kurt Cobain as its lead singer?",
    "answers": [
      "Coldplay",
      "Green Day",
      "Radiohead",
      "Nirvana"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90087,
    "category": "World music",
    "text": "Which instrument is closely associated with Louis Armstrong?",
    "answers": [
      "Violin",
      "Harp",
      "Trumpet",
      "Piano"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90088,
    "category": "World music",
    "text": "Which artist recorded the album Purple Rain?",
    "answers": [
      "Michael Jackson",
      "Prince",
      "David Bowie",
      "Elton John"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90089,
    "category": "World music",
    "text": "In which band did Sting first find major fame?",
    "answers": [
      "The Police",
      "Queen",
      "U2",
      "Oasis"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90090,
    "category": "World music",
    "text": "Who released the song Rolling in the Deep?",
    "answers": [
      "Rihanna",
      "Lady Gaga",
      "Cher",
      "Adele"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90091,
    "category": "World music",
    "text": "Which band released the album Abbey Road?",
    "answers": [
      "Queen",
      "Pink Floyd",
      "The Beatles",
      "The Rolling Stones"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90092,
    "category": "Sports",
    "text": "Which sport includes the Tour de France competition?",
    "answers": [
      "Running",
      "Cycling",
      "Swimming",
      "Sailing"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90093,
    "category": "Sports",
    "text": "Which sport uses the term home run?",
    "answers": [
      "Baseball",
      "Basketball",
      "Tennis",
      "Handball"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90094,
    "category": "Sports",
    "text": "Which country won the 2014 FIFA World Cup?",
    "answers": [
      "Brazil",
      "Argentina",
      "France",
      "Germany"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90095,
    "category": "Sports",
    "text": "In which sport is Wimbledon a major championship?",
    "answers": [
      "Golf",
      "Cricket",
      "Tennis",
      "Rugby"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90096,
    "category": "Food and culture",
    "text": "Which fruit is the main ingredient in guacamole?",
    "answers": [
      "Mango",
      "Avocado",
      "Pineapple",
      "Apple"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90097,
    "category": "Food and culture",
    "text": "Which legume is widely used to make falafel in the Middle East?",
    "answers": [
      "Chickpeas",
      "Green peas",
      "Red kidney beans",
      "Soybeans"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90098,
    "category": "Food and culture",
    "text": "Which country is especially associated with paella?",
    "answers": [
      "Italy",
      "Germany",
      "Japan",
      "Spain"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90099,
    "category": "Food and culture",
    "text": "Which plant's leaves are used to make traditional tea?",
    "answers": [
      "Coffee arabica",
      "Cocoa tree",
      "Camellia sinensis",
      "Grape vine"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90100,
    "category": "Technology",
    "text": "Which device turns digital documents into printed pages?",
    "answers": [
      "Router",
      "Printer",
      "Monitor",
      "Microphone"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90101,
    "category": "Technology",
    "text": "Which type of memory stores a computer's short-term working data?",
    "answers": [
      "RAM",
      "DVD",
      "SSD",
      "USB flash drive"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90102,
    "category": "Technology",
    "text": "Which tool helps protect accounts by generating unique temporary login codes?",
    "answers": [
      "Music player",
      "Photo editor",
      "Calendar",
      "Authenticator app"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90103,
    "category": "Technology",
    "text": "What is the name of the open web platform created by Tim Berners-Lee?",
    "answers": [
      "Bluetooth",
      "GPS",
      "World Wide Web",
      "Wi-Fi"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90104,
    "category": "Art and literature",
    "text": "Which writer created the detective Hercule Poirot?",
    "answers": [
      "Arthur Conan Doyle",
      "Agatha Christie",
      "Jules Verne",
      "George Orwell"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "locale": "en",
    "id": 90105,
    "category": "Art and literature",
    "text": "Which painting by Vincent van Gogh features a swirling night sky?",
    "answers": [
      "The Starry Night",
      "Water Lilies",
      "The Scream",
      "Guernica"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "locale": "en",
    "id": 90106,
    "category": "Art and literature",
    "text": "Which artist painted The Persistence of Memory?",
    "answers": [
      "Pablo Picasso",
      "Claude Monet",
      "Edvard Munch",
      "Salvador Dalí"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "locale": "en",
    "id": 90107,
    "category": "Art and literature",
    "text": "Which children's book features a boy named Charlie and a chocolate factory?",
    "answers": [
      "Peter Pan",
      "Matilda",
      "Charlie and the Chocolate Factory",
      "The BFG"
    ],
    "correct": 2,
    "difficulty": 2
  }
];
export const LOCAL_QUESTION_RELEASE_BATCH = 3;
export function freshLocalQuestions(locale:'he'|'en',released:number){
 const max=Math.max(0,Math.min(released,200));
 return freshLocalQuestionReserve.filter(q=>q.locale===locale).slice(0,max);
}
export function countLocalReserve(locale:'he'|'en'){
 return freshLocalQuestionReserve.filter(q=>q.locale===locale).length;
}
