/** Crossword-style question editor: a broad brief and explicitly verifiable templates. */
export const LANGUAGES=['he','en','ru','fr','ar'];
const names=[
['israel-politics','פוליטיקה בישראל','Israeli politics','Politique israélienne','Политика Израиля','السياسة الإسرائيلية'],
['world-politics','פוליטיקה בעולם','World politics','Politique mondiale','Мировая политика','السياسة العالمية'],
['israel-history','היסטוריה של ישראל','Israeli history','Histoire d’Israël','История Израиля','تاريخ إسرائيل'],
['world-history','היסטוריה עולמית','World history','Histoire mondiale','Всемирная история','تاريخ العالم'],
['israel-tv','סדרות ישראליות','Israeli TV','Séries israéliennes','Израильские сериалы','المسلسلات الإسرائيلية'],
['world-tv','סדרות בעולם','TV series','Séries télévisées','Телесериалы','المسلسلات التلفزيونية'],
['israel-cinema','קולנוע ישראלי','Israeli cinema','Cinéma israélien','Израильское кино','السينما الإسرائيلية'],
['world-cinema','קולנוע עולמי','World cinema','Cinéma mondial','Мировое кино','السينما العالمية'],
['israel-music','מוזיקה ישראלית','Israeli music','Musique israélienne','Израильская музыка','الموسيقى الإسرائيلية'],
['world-music','מוזיקה בעולם','World music','Musique mondiale','Мировая музыка','الموسيقى العالمية'],
['books','ספרים וסופרים','Books and writers','Livres et écrivains','Книги и писатели','الكتب والكتّاب'],
['poetry','משוררים ושירה','Poetry','Poésie','Поэзия','الشعر'],
['art','אמנות וציירים','Fine art','Beaux-arts','Живопись','الفنون الجميلة'],
['architecture','אדריכלות ואתרים','Architecture','Architecture','Архитектура','العمارة'],
['geography','גאוגרפיה','Geography','Géographie','География','الجغرافيا'],
['science','מדע ותגליות','Science','Sciences','Наука','العلوم'],
['space','חלל ואסטרונומיה','Space','Espace','Космос','الفضاء'],
['nature','טבע ובעלי חיים','Nature','Nature','Природа','الطبيعة'],
['technology','טכנולוגיה ומחשבים','Technology','Technologie','Технологии','التكنولوجيا'],
['inventions','ממציאים והמצאות','Inventions','Inventions','Изобретения','الاختراعات'],
['sports','ספורט','Sports','Sport','Спорт','الرياضة'],
['football','כדורגל','Football','Football','Футбол','كرة القدم'],
['olympics','אולימפיאדות','Olympics','Jeux olympiques','Олимпийские игры','الألعاب الأولمبية'],
['food','אוכל ומטבחים','Cuisine','Gastronomie','Кухни мира','الأطعمة'],
['languages','שפות ומילים','Languages','Langues','Языки','اللغات'],
['religion-culture','מסורות ותרבויות','Traditions','Traditions','Традиции','التقاليد'],
['children-media','תוכניות וסרטי ילדים','Children’s media','Médias jeunesse','Детские фильмы','برامج الأطفال'],
['famous-people','אישים מפורסמים','Famous people','Personnalités','Знаменитости','شخصيات مشهورة'],
['nobel','פרסי נובל','Nobel Prize','Prix Nobel','Нобелевские премии','جوائز نوبل'],
['crossword-clues','רמזים וחידות ידע','Crossword clues','Devinettes','Загадки','الألغاز']
];
export const CATEGORIES=names.map(([id,he,en,fr,ru,ar])=>({id,he,en,fr,ru,ar}));
export const FACT_TEMPLATES=[
 ['capital','geography','Q6256','P36','capital',1],
 ['currency','geography','Q6256','P38','currency',2],
 ['film-director','world-cinema','Q11424','P57','director',2],
 ['film-screenwriter','world-cinema','Q11424','P58','screenwriter',3],
 ['film-origin','world-cinema','Q11424','P495','origin',2],
 ['israel-film-director','israel-cinema','Q11424','P57','director',2,'P495','Q801'],
 ['series-creator','world-tv','Q5398426','P170','seriesCreator',2],
 ['israel-series-creator','israel-tv','Q5398426','P170','seriesCreator',3,'P495','Q801'],
 ['book-author','books','Q571','P50','author',2],
 ['novel-author','books','Q8261','P50','author',2],
 ['album-performer','world-music','Q482994','P175','albumPerformer',2],
 ['song-performer','world-music','Q7366','P175','songPerformer',2],
 ['painting-artist','art','Q3305213','P170','painter',2],
 ['sculpture-artist','art','Q860861','P170','sculptor',3],
 ['building-architect','architecture','Q41176','P84','architect',3],
 ['company-founder','technology','Q4830453','P112','founder',3],
 ['football-birthplace','football','Q937857','P19','birthCity',3],
 ['writer-birthplace','books','Q49757','P19','birthCity',3],
 ['israel-politician-birthplace','israel-politics','Q82955','P19','birthCity',3,'P27','Q801']
].map(([id,category,classId,property,phrase,difficulty,extraProperty,extraItem])=>({
 id,category,classId,property,phrase,difficulty,extraProperty,extraItem
}));
const PHRASES={
 capital:['מהי עיר הבירה של %s?','What is the capital of %s?','Какова столица государства %s?','Quelle est la capitale de %s ?','ما عاصمة %s؟'],
 currency:['מהו המטבע של %s?','What currency is used in %s?','Какая валюта используется в %s?','Quelle monnaie utilise %s ?','ما عملة %s؟'],
 director:['מי ביים את הסרט „%s”?','Who directed the film “%s”?','Кто снял фильм «%s»?','Qui a réalisé le film « %s » ?','من أخرج فيلم «%s»؟'],
 screenwriter:['מי כתב את תסריט הסרט „%s”?','Who wrote the screenplay for “%s”?','Кто написал сценарий фильма «%s»?','Qui a écrit le scénario du film « %s » ?','من كتب سيناريو فيلم «%s»؟'],
 origin:['מאיזו מדינה הגיע הסרט „%s”?','Which country produced the film “%s”?','В какой стране был создан фильм «%s»?','Dans quel pays le film « %s » a-t-il été produit ?','في أي بلد أُنتج فيلم «%s»؟'],
 seriesCreator:['מי יצר את הסדרה „%s”?','Who created the television series “%s”?','Кто создал телесериал «%s»?','Qui a créé la série « %s » ?','من أنشأ المسلسل «%s»؟'],
 author:['מי כתב את הספר „%s”?','Who wrote the book “%s”?','Кто написал книгу «%s»?','Qui a écrit le livre « %s » ?','من كتب كتاب «%s»؟'],
 albumPerformer:['מי ביצע את האלבום „%s”?','Who performed the album “%s”?','Кто исполнил альбом «%s»?','Qui a interprété l’album « %s » ?','من قدّم ألبوم «%s»؟'],
 songPerformer:['מי ביצע את השיר „%s”?','Who performed the song “%s”?','Кто исполнил песню «%s»?','Qui a interprété la chanson « %s » ?','من أدّى أغنية «%s»؟'],
 painter:['מי צייר את היצירה „%s”?','Who painted “%s”?','Кто написал картину «%s»?','Qui a peint « %s » ?','من رسم لوحة «%s»؟'],
 sculptor:['מי פיסל את „%s”?','Who sculpted “%s”?','Кто создал скульптуру «%s»?','Qui a sculpté « %s » ?','من نحت «%s»؟'],
 architect:['מי האדריכל שתכנן את „%s”?','Who designed the building “%s”?','Кто архитектор здания «%s»?','Qui a conçu le bâtiment « %s » ?','من صمّم مبنى «%s»؟'],
 founder:['מי ייסד את החברה „%s”?','Who founded the company “%s”?','Кто основал компанию «%s»?','Qui a fondé l’entreprise « %s » ?','من أسس شركة «%s»؟'],
 birthCity:['באיזו עיר נולד/ה %s?','In which city was %s born?','В каком городе родился или родилась %s?','Dans quelle ville est né(e) %s ?','في أي مدينة وُلدت شخصية %s؟']
};
export function phraseFor(phrase,locale,subject){
 const v=PHRASES[phrase]?.[LANGUAGES.indexOf(locale)];
 if(!v||!subject||/^\s*Q\d+$/.test(subject))throw new Error('Untranslated or unrecognized clue');
 return v.replace('%s',subject);
}
export const TOPICS_NEEDING_EDITORIAL_SOURCES=CATEGORIES.filter(c=>!FACT_TEMPLATES.some(f=>f.category===c.id)).map(c=>c.id);
