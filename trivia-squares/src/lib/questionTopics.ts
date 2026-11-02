/** A stable topic taxonomy: user preferences survive stages, modes and reloads.
 * Categories are intentionally broad; the author retains each original category.
 */
export const questionTopics=[
 {id:'tv_film',he:'סרטים וסדרות',en:'Films & television',ru:'Кино и сериалы',fr:'Cinéma et séries',ar:'الأفلام والمسلسلات',es:'Películas y series'},
 {id:'disney',he:'סרטי דיסני',en:'Disney films',ru:'Фильмы Диснея',fr:'Films Disney',ar:'أفلام ديزني',es:'Películas de Disney'},
 {id:'music',he:'מוזיקה ישראלית ועולמית',en:'Music',ru:'Музыка',fr:'Musique',ar:'الموسيقى',es:'Música'},
 {id:'eurovision',he:'אירוויזיון',en:'Eurovision',ru:'Евровидение',fr:'Eurovision',ar:'يوروفيجن',es:'Eurovisión'},
 {id:'israel_politics',he:'ישראל, כנסת ופוליטיקה',en:'Israel & politics',ru:'Израиль и политика',fr:'Israël et politique',ar:'إسرائيل والسياسة',es:'Israel y política'},
 {id:'capitals',he:'בירות ומדינות העולם',en:'Countries & capitals',ru:'Страны и столицы',fr:'Pays et capitales',ar:'الدول والعواصم',es:'Países y capitales'},
 {id:'aviation',he:'תעופה וחברות תעופה',en:'Aviation & airlines',ru:'Авиация',fr:'Aviation',ar:'الطيران',es:'Aviación y aerolíneas'},
 {id:'cars',he:'מכוניות ומותגים',en:'Cars & brands',ru:'Автомобили',fr:'Automobiles',ar:'السيارات',es:'Coches y marcas'},
 {id:'sports',he:'ספורט',en:'Sports',ru:'Спорт',fr:'Sport',ar:'الرياضة',es:'Deportes'},
 {id:'science',he:'מדע, חלל וטכנולוגיה',en:'Science, space & tech',ru:'Наука и технологии',fr:'Sciences et technologie',ar:'العلوم والتكنولوجيا',es:'Ciencia, espacio y tecnología'},
 {id:'nature',he:'טבע ובעלי חיים',en:'Nature & animals',ru:'Природа и животные',fr:'Nature et animaux',ar:'الطبيعة والحيوانات',es:'Naturaleza y animales'},
 {id:'history',he:'היסטוריה ותרבות',en:'History & culture',ru:'История и культура',fr:'Histoire et culture',ar:'التاريخ والثقافة',es:'Historia y cultura'},
 {id:'food',he:'אוכל, מטבח ופירות',en:'Food & cooking',ru:'Еда и кухня',fr:'Cuisine',ar:'الطعام والمطبخ',es:'Comida y cocina'},
 {id:'arts',he:'ספרות, אמנות ומשחקים',en:'Arts, books & games',ru:'Искусство и книги',fr:'Arts et livres',ar:'الفنون والكتب',es:'Arte, literatura y juegos'},
 {id:'languages',he:'איך אומרים? שפות העולם',en:'How do you say it? Languages',ru:'Как сказать? Языки мира',fr:'Comment dit-on ? Langues',ar:'كيف نقولها؟ لغات العالم',es:'¿Cómo se dice? Idiomas'},
 {id:'israel_geography',he:'גאוגרפיה של ישראל',en:'Geography of Israel',ru:'География Израиля',fr:'Géographie d’Israël',ar:'جغرافيا إسرائيل',es:'Geografía de Israel'},
 {id:'bible',he:'גיבורי התנ״ך',en:'Bible heroes',ru:'Герои Библии',fr:'Héros de la Bible',ar:'شخصيات الكتاب المقدس',es:'Héroes de la Biblia'},
 {id:'general',he:'ידע כללי והעשרה',en:'General knowledge',ru:'Общие знания',fr:'Culture générale',ar:'معرفة عامة',es:'Cultura general'}
] as const;
export type QuestionTopic=typeof questionTopics[number]['id'];
export const ALL_QUESTION_TOPICS=questionTopics.map(t=>t.id);
export function topicForQuestion(category:string,text:string):QuestionTopic{
 const c=String(category).toLocaleLowerCase();
 const q=String(text).toLocaleLowerCase();
 const both=c+' '+q;
 // Owner-requested categories are matched on the curated category label first, so
 // Israeli geography is its own topic and is not capped like world geography.
 if(/גאוגרפיה של ישראל|geography of israel/.test(c))return 'israel_geography';
 if(/תנ״ך|תנ"ך|bible/.test(c))return 'bible';
 if(/איך אומרים|איך אומרים את|how do you say|how to say|language translation|pronunciation|как сказать|как произнести|comment dit.on|cómo se dice|como se dice|كيف نقول|كيف تقول|traducción de palabras|תרגום מילים/.test(both))return 'languages';
 if(/תעופה|טיס|חברת תעופה|airline|aviation|aircraft|авиац|compagnie aérienne|طيران/.test(both))return 'aviation';
 if(/מכונ|רכב|יצרנית|רכבי|automobile|car brand|automo|автомоб|سيار/.test(both))return 'cars';
 if(/כנסת|ממשלה|פוליטיק|ראש ממשלה|נשיא ישראל|בחירות|politic|knesset|политик|السياس/.test(both))return 'israel_politics';
 if(/בירת|עיר הבירה|capital|столиц|capitale|عاصم|capitales/.test(q))return 'capitals';
 if(/ספורט|כדורגל|כדורסל|אולימפ|טניס|sport|football|basketball|tennis|спор|رياض/.test(both))return 'sports';
 // Disney is a selectable category rather than being absorbed into generic films.
 if(/דיסני|disney|дисне|ديزني/i.test(both))return 'disney';
 if(/סדרות|סדרה|טלוויז|קולנוע|סרט|film|movie|television|series|cinéma|кино|сериал|مسلسل|أفلام|películas|cine|disney|friends/.test(both))return 'tv_film';
 if(/אירוויזיון|eurovision|евровидени|يوروفيجن|يوروفيزيون|eurovisión/.test(both))return 'eurovision';
 if(/מוזיק|שיר|זמר|להקה|אלבום|music|song|singer|band|музык|chanson|musique|موسيقى|أغنية|música|canción|cantante/.test(both))return 'music';
 if(/מדע|חלל|טכנולוג|פיזיק|כימ|מחשב|science|technology|space|computer|наук|технолог|sciences|informatique|العلوم|التكنولوجيا/.test(both))return 'science';
 if(/טבע|בעל חיים|חיה|ציפור|עץ|צמח|nature|animal|wildlife|природ|nature|حيوان|الطبيعة/.test(both))return 'nature';
 if(/היסטור|תרבות|מלחמ|עתיק|history|culture|historic|истори|история|histoire|culture|تاريخ|الثقافة|historia|tratados|paz/.test(both))return 'history';
 if(/אוכל|מאכל|בישול|פירות|מטבח|food|cooking|fruit|gastronomie|cuisine|еда|кухн|الطعام/.test(both))return 'food';
 if(/ספרות|אמנות|ציור|ספר|משחקי|literature|art|book|games|искусств|littérature|الفنون|الكتب/.test(both))return 'arts';
 if(/גאוגרפ|מדינ|עיר|נהר|אוקיינוס|geograph|country|countries|continent|географ|géographie|الجغرافيا|geografía|ciudad|país|países/.test(both))return 'capitals';
 if(/ישראל|israel|израил|إسرائيل/.test(both))return 'israel_politics';
 return 'general';
}
/** Topics added after the 16-topic catalog. Players who had every topic selected
 *  in any earlier catalog keep "everything selected" and receive these too. */
const ADDED_AFTER_16=['israel_geography','bible'] as const;
const CATALOG_16=ALL_QUESTION_TOPICS.filter(t=>!(ADDED_AFTER_16 as readonly string[]).includes(t));
const without=(ids:readonly string[])=>CATALOG_16.filter(t=>!ids.includes(t));
const LEGACY_FULL_SELECTIONS:readonly (readonly QuestionTopic[])[]=[
 CATALOG_16,
 without(['languages']),
 without(['disney']),
 without(['disney','languages']),
 without(['eurovision','disney']),
 without(['eurovision','disney','languages'])
];
export function parseTopicPreferences(raw:unknown):QuestionTopic[]{
 if(!Array.isArray(raw))return [...ALL_QUESTION_TOPICS];
 const set=new Set(raw.filter((x):x is QuestionTopic=>ALL_QUESTION_TOPICS.includes(x as QuestionTopic)));
 // Preserve the complete-selection intent across taxonomy expansions; a deliberately
 // narrowed selection stays exactly as the player chose it.
 if(LEGACY_FULL_SELECTIONS.some(full=>full.length===set.size&&full.every(t=>set.has(t))))return [...ALL_QUESTION_TOPICS];
 return set.size?ALL_QUESTION_TOPICS.filter(t=>set.has(t)):[...ALL_QUESTION_TOPICS];
}
