/** A stable topic taxonomy: user preferences survive stages, modes and reloads.
 * Categories are intentionally broad; the author retains each original category.
 */
export const questionTopics=[
 {id:'tv_film',he:'סרטים וסדרות',en:'Films & television',ru:'Кино и сериалы',fr:'Cinéma et séries',ar:'الأفلام والمسلسلات'},
 {id:'music',he:'מוזיקה ישראלית ועולמית',en:'Music',ru:'Музыка',fr:'Musique',ar:'الموسيقى'},
 {id:'israel_politics',he:'ישראל, כנסת ופוליטיקה',en:'Israel & politics',ru:'Израиль и политика',fr:'Israël et politique',ar:'إسرائيل والسياسة'},
 {id:'capitals',he:'בירות ומדינות העולם',en:'Countries & capitals',ru:'Страны и столицы',fr:'Pays et capitales',ar:'الدول والعواصم'},
 {id:'aviation',he:'תעופה וחברות תעופה',en:'Aviation & airlines',ru:'Авиация',fr:'Aviation',ar:'الطيران'},
 {id:'cars',he:'מכוניות ומותגים',en:'Cars & brands',ru:'Автомобили',fr:'Automobiles',ar:'السيارات'},
 {id:'sports',he:'ספורט',en:'Sports',ru:'Спорт',fr:'Sport',ar:'الرياضة'},
 {id:'science',he:'מדע, חלל וטכנולוגיה',en:'Science, space & tech',ru:'Наука и технологии',fr:'Sciences et technologie',ar:'العلوم والتكنولوجيا'},
 {id:'nature',he:'טבע ובעלי חיים',en:'Nature & animals',ru:'Природа и животные',fr:'Nature et animaux',ar:'الطبيعة والحيوانات'},
 {id:'history',he:'היסטוריה ותרבות',en:'History & culture',ru:'История и культура',fr:'Histoire et culture',ar:'التاريخ والثقافة'},
 {id:'food',he:'אוכל, מטבח ופירות',en:'Food & cooking',ru:'Еда и кухня',fr:'Cuisine',ar:'الطعام والمطبخ'},
 {id:'arts',he:'ספרות, אמנות ומשחקים',en:'Arts, books & games',ru:'Искусство и книги',fr:'Arts et livres',ar:'الفنون والكتب'},
 {id:'general',he:'ידע כללי והעשרה',en:'General knowledge',ru:'Общие знания',fr:'Culture générale',ar:'معرفة عامة'}
] as const;
export type QuestionTopic=typeof questionTopics[number]['id'];
export const ALL_QUESTION_TOPICS=questionTopics.map(t=>t.id);
export function topicForQuestion(category:string,text:string):QuestionTopic{
 const c=String(category).toLocaleLowerCase();
 const q=String(text).toLocaleLowerCase();
 const both=c+' '+q;
 if(/תעופה|טיס|חברת תעופה|airline|aviation|aircraft|авиац|compagnie aérienne|طيران/.test(both))return 'aviation';
 if(/מכונ|רכב|יצרנית|רכבי|automobile|car brand|automo|автомоб|سيار/.test(both))return 'cars';
 if(/כנסת|ממשלה|פוליטיק|ראש ממשלה|נשיא ישראל|בחירות|politic|knesset|политик|السياس/.test(both))return 'israel_politics';
 if(/בירת|עיר הבירה|capital|столиц|capitale|عاصم/.test(q))return 'capitals';
 if(/ספורט|כדורגל|כדורסל|אולימפ|טניס|sport|football|basketball|tennis|спор|رياض/.test(both))return 'sports';
 if(/סדרות|סדרה|טלוויז|קולנוע|סרט|film|movie|television|series|cinéma|кино|сериал|مسلسل|أفلام/.test(both))return 'tv_film';
 if(/מוזיק|שיר|זמר|להקה|אלבום|music|song|singer|band|музык|chanson|musique|موسيقى|أغنية/.test(both))return 'music';
 if(/מדע|חלל|טכנולוג|פיזיק|כימ|מחשב|science|technology|space|computer|наук|технолог|sciences|informatique|العلوم|التكنولوجيا/.test(both))return 'science';
 if(/טבע|בעל חיים|חיה|ציפור|עץ|צמח|nature|animal|wildlife|природ|nature|حيوان|الطبيعة/.test(both))return 'nature';
 if(/היסטור|תרבות|מלחמ|עתיק|history|culture|historic|истори|история|histoire|culture|تاريخ|الثقافة/.test(both))return 'history';
 if(/אוכל|מאכל|בישול|פירות|מטבח|food|cooking|fruit|gastronomie|cuisine|еда|кухн|الطعام/.test(both))return 'food';
 if(/ספרות|אמנות|ציור|ספר|משחקי|literature|art|book|games|искусств|littérature|الفنون|الكتب/.test(both))return 'arts';
 if(/גאוגרפ|מדינ|עיר|נהר|אוקיינוס|geograph|country|countries|continent|географ|géographie|الجغرافيا/.test(both))return 'capitals';
 if(/ישראל|israel|израил|إسرائيل/.test(both))return 'israel_politics';
 return 'general';
}
export function parseTopicPreferences(raw:unknown):QuestionTopic[]{
 if(!Array.isArray(raw))return [...ALL_QUESTION_TOPICS];
 const set=new Set(raw.filter((x):x is QuestionTopic=>ALL_QUESTION_TOPICS.includes(x as QuestionTopic)));
 return set.size?ALL_QUESTION_TOPICS.filter(t=>set.has(t)):[...ALL_QUESTION_TOPICS];
}
