/** Localized optional intermissions. No network translation or paid services. */
import type {ActiveLocale} from './i18n';
import type {StageCard} from './stageRewards';

type GameCopy = Record<string,string>;
const copy: Record<'ru'|'fr'|'ar',GameCopy> = {
 ru:{
  '✨ אוסף הסודות נפתח':'✨ Открыта коллекция секретов','מכינים את קלף הבונוס...':'Подготавливаем наградную карточку...',
  '✦ קלף אספנות חדש ✦':'✦ Новая коллекционная карточка ✦',
  'פתחת את כל הריבועים. גילית אוצר!':'Все квадраты закрыты. Сокровище найдено!',
  'הרווחת קלף ייחודי לשלב הזה. הוא נכנס לאלבום שלך ואינו נעלם.':'Вы получили карточку этапа. Она навсегда останется в альбоме.',
  'האתגר שבין העולמות':'Испытание между мирами','מה בא לך לעשות עם האוצר?':'Как использовать сокровище?',
  'לבחירתך אתגר אחד לכל שלב. אפשר גם לדלג ולהתקדם.':'Выберите одно испытание или переходите дальше.',
  '🔠 נחש את המילה':'🔠 Угадай слово','רמז ואותיות לאוצר הבא':'Подсказка к следующему сокровищу',
  '🎡 גלגל ההפתעות':'🎡 Колесо призов','פרס וירטואלי, ללא תשלום':'Бесплатный виртуальный приз',
  'רמז:':'Подсказка:','מה המילה?':'Что за слово?','בדוק מילה ✨':'Проверить слово ✨',
  'סובב את הגלגל ✨':'Крутить колесо ✨','🎉 הפרס שלך:':'🎉 Ваш приз:',
  'נשמר באוסף המשחק שלך.':'Сохранено в вашей коллекции.',
  'המשך לשלב הבא ←':'Следующий этап →','🏆 השלמת את כל 100 השלבים — אלוף הטריוויה!':'🏆 Все 100 этапов пройдены! Вы чемпион!',
  '📚 האלבום שלי ·':'📚 Мой альбом ·','קלפים':'карточек','★ אתגר הושלם':'★ Испытание пройдено',
  'קלף נאסף':'Карточка получена','שלב':'ЭТАП','אגדי':'Легендарная','נדיר':'Редкая','מיוחד':'Особая',
  '10 קרדיטים':'10 монет','15 קרדיטים':'15 монет','5 פירות':'5 фруктов','2 פירות':'2 фрукта',
  'יהלום אחד':'1 алмаз','קמע זמן אחד':'1 талисман времени','אותיות':'букв'
 },
 fr:{
  '✨ אוסף הסודות נפתח':'✨ Collection secrète débloquée','מכינים את קלף הבונוס...':'Préparation de votre carte bonus...',
  '✦ קלף אספנות חדש ✦':'✦ Nouvelle carte à collectionner ✦',
  'פתחת את כל הריבועים. גילית אוצר!':'Toutes les cases sont fermées. Trésor découvert !',
  'הרווחת קלף ייחודי לשלב הזה. הוא נכנס לאלבום שלך ואינו נעלם.':'Vous avez gagné une carte unique conservée dans votre album.',
  'האתגר שבין העולמות':'Défi entre les mondes','מה בא לך לעשות עם האוצר?':'Que faire de votre trésor ?',
  'לבחירתך אתגר אחד לכל שלב. אפשר גם לדלג ולהתקדם.':'Choisissez un défi par niveau ou passez au suivant.',
  '🔠 נחש את המילה':'🔠 Devinez le mot','רמז ואותיות לאוצר הבא':'Un indice pour votre prochain trésor',
  '🎡 גלגל ההפתעות':'🎡 Roue des cadeaux','פרס וירטואלי, ללא תשלום':'Récompense virtuelle gratuite',
  'רמז:':'Indice :','מה המילה?':'Quel est le mot ?','בדוק מילה ✨':'Vérifier ✨',
  'סובב את הגלגל ✨':'Tourner la roue ✨','🎉 הפרס שלך:':'🎉 Votre cadeau :',
  'נשמר באוסף המשחק שלך.':'Enregistré dans votre collection.',
  'המשך לשלב הבא ←':'Niveau suivant →','🏆 השלמת את כל 100 השלבים — אלוף הטריוויה!':'🏆 100 niveaux terminés. Vous êtes champion !',
  '📚 האלבום שלי ·':'📚 Mon album ·','קלפים':'cartes','★ אתגר הושלם':'★ Défi terminé',
  'קלף נאסף':'Carte obtenue','שלב':'NIVEAU','אגדי':'Légendaire','נדיר':'Rare','מיוחד':'Spécial',
  '10 קרדיטים':'10 crédits','15 קרדיטים':'15 crédits','5 פירות':'5 fruits','2 פירות':'2 fruits',
  'יהלום אחד':'1 diamant','קמע זמן אחד':'1 talisman temporel','אותיות':'lettres'
 },
 ar:{
  '✨ אוסף הסודות נפתח':'✨ تم فتح مجموعة الأسرار','מכינים את קלף הבונוס...':'يجري تجهيز بطاقة المكافأة...',
  '✦ קלף אספנות חדש ✦':'✦ بطاقة جديدة للمجموعة ✦',
  'פתחת את כל הריבועים. גילית אוצר!':'أغلقت جميع المربعات واكتشفت كنزًا!',
  'הרווחת קלף ייחודי לשלב הזה. הוא נכנס לאלבום שלך ואינו נעלם.':'حصلت على بطاقة فريدة لهذا المستوى محفوظة في ألبومك.',
  'האתגר שבין העולמות':'تحدي بين العوالم','מה בא לך לעשות עם האוצר?':'ماذا تريد أن تفعل بالكنز؟',
  'לבחירתך אתגר אחד לכל שלב. אפשר גם לדלג ולהתקדם.':'اختر تحديًا واحدًا لكل مستوى أو انتقل إلى التالي.',
  '🔠 נחש את המילה':'🔠 خمّن الكلمة','רמז ואותיות לאוצר הבא':'تلميح للكنز التالي',
  '🎡 גלגל ההפתעות':'🎡 عجلة الجوائز','פרס וירטואלי, ללא תשלום':'جائزة افتراضية مجانية',
  'רמז:':'تلميح:','מה המילה?':'ما الكلمة؟','בדוק מילה ✨':'تحقق من الكلمة ✨',
  'סובב את הגלגל ✨':'أدر العجلة ✨','🎉 הפרס שלך:':'🎉 جائزتك:',
  'נשמר באוסף המשחק שלך.':'تم الحفظ في مجموعتك.',
  'המשך לשלב הבא ←':'المستوى التالي ←','🏆 השלמת את כל 100 השלבים — אלוף הטריוויה!':'🏆 أكملت المراحل المئة. أنت بطل المسابقة!',
  '📚 האלבום שלי ·':'📚 ألبومي ·','קלפים':'بطاقات','★ אתגר הושלם':'★ اكتمل التحدي',
  'קלף נאסף':'تم جمع البطاقة','שלב':'المستوى','אגדי':'أسطوري','נדיר':'نادر','מיוחד':'مميز',
  '10 קרדיטים':'10 عملات','15 קרדיטים':'15 عملة','5 פירות':'5 فواكه','2 פירות':'ثمرتان',
  'יהלום אחד':'ماسة واحدة','קמע זמן אחד':'تعويذة وقت واحدة','אותיות':'حروف'
 }
};
export const localeWords:Record<ActiveLocale,Record<number,{answer:string;hint:string}>>={
 he:{3:{answer:'תפוח',hint:'פרי שגדל על עץ בגן'},4:{answer:'יהלום',hint:'אבן יקרה נוצצת במיוחד'},5:{answer:'עננים',hint:'שטים בשמיים ולעיתים מורידים גשם'},6:{answer:'גלקסיה',hint:'מערכת עצומה של כוכבים'}},
 en:{3:{answer:'apple',hint:'A fruit from an orchard tree'},4:{answer:'diamond',hint:'A sparkling precious stone'},5:{answer:'clouds',hint:'They float in the sky and bring rain'},6:{answer:'galaxy',hint:'A vast collection of stars'}},
 ru:{3:{answer:'яблоко',hint:'Фрукт, растущий на дереве в саду'},4:{answer:'алмаз',hint:'Очень твёрдый блестящий драгоценный камень'},5:{answer:'облака',hint:'Они плывут по небу и приносят дождь'},6:{answer:'галактика',hint:'Огромное скопление звёзд'}},
 fr:{3:{answer:'pomme',hint:'Fruit qui pousse sur un arbre au verger'},4:{answer:'diamant',hint:'Pierre précieuse très brillante'},5:{answer:'nuages',hint:'Ils flottent dans le ciel et apportent la pluie'},6:{answer:'galaxie',hint:'Immense ensemble d’étoiles'}},
 ar:{3:{answer:'تفاحة',hint:'فاكهة تنمو على شجرة في البستان'},4:{answer:'ألماس',hint:'حجر كريم شديد اللمعان'},5:{answer:'غيوم',hint:'تطفو في السماء وقد تحمل المطر'},6:{answer:'مجرة',hint:'مجموعة ضخمة من النجوم'}}
};
const cards:Record<'en'|'ru'|'fr'|'ar',Record<number,[string,string]>>={
 en:{3:['Leonardo da Vinci','Renaissance artist and inventor'],4:['Marie Curie','Pioneer of radioactivity research'],5:['Amelia Earhart','Pioneer aviator'],6:['Galileo Galilei','Astronomer and natural philosopher']},
 ru:{3:['Леонардо да Винчи','Художник и изобретатель эпохи Возрождения'],4:['Мария Кюри','Исследовательница радиоактивности'],5:['Амелия Эрхарт','Пионер авиации'],6:['Галилео Галилей','Астроном и учёный']},
 fr:{3:['Léonard de Vinci','Artiste et inventeur de la Renaissance'],4:['Marie Curie','Pionnière de la recherche sur la radioactivité'],5:['Amelia Earhart','Pionnière de l’aviation'],6:['Galilée','Astronome et physicien']},
 ar:{3:['ليوناردو دا فينشي','فنان ومخترع من عصر النهضة'],4:['ماري كوري','رائدة أبحاث النشاط الإشعاعي'],5:['أميليا إيرهارت','رائدة في الطيران'],6:['غاليليو غاليلي','عالم فلك وفيزياء']}
};
export function intermissionText(locale:ActiveLocale,he:string,en:string):string{
 if(locale==='he')return he;
 if(locale==='en')return en;
 return copy[locale][he]||en;
}
export function intermissionWord(locale:ActiveLocale,worldSize:number){
 return localeWords[locale][worldSize]||localeWords[locale][3];
}
export function intermissionPrize(locale:ActiveLocale,prize:string):string{
 if(locale==='he')return prize;
 const english:Record<string,string>={'10 קרדיטים':'10 credits','15 קרדיטים':'15 credits','5 פירות':'5 fruit','2 פירות':'2 fruit','יהלום אחד':'1 gem','קמע זמן אחד':'1 time charm'};
 if(locale==='en')return english[prize]||prize;
 return copy[locale][prize]||english[prize]||prize;
}
export function intermissionCard(locale:ActiveLocale,card:StageCard):StageCard{
 if(locale==='he')return card;
 const text=cards[locale][card.world];
 if(!text)return card;
 if(card.kind==='portrait')return {...card,title:text[0],subtitle:text[1]};
 const letter=intermissionWord(locale,card.world).answer[0].toUpperCase();
 if(card.kind==='letter')return {...card,title:(locale==='ru'?'Буква сокровища: ':locale==='fr'?'Lettre du trésor : ':locale==='ar'?'حرف الكنز: ':'Treasure letter: ')+letter,subtitle:locale==='ru'?'Подсказка к игре со словами':locale==='fr'?'Indice pour le jeu de mots':locale==='ar'?'تلميح للعبة الكلمات':'A clue for the word puzzle',glyph:letter};
 return {...card,title:locale==='ru'?'Мелодия '+intermissionWord(locale,card.world).answer:locale==='fr'?'Mélodie '+intermissionWord(locale,card.world).answer:locale==='ar'?'لحن '+intermissionWord(locale,card.world).answer:'Original '+intermissionWord(locale,card.world).answer+' song',subtitle:locale==='ru'?'Оригинальная музыкальная карточка':locale==='fr'?'Carte musicale originale':locale==='ar'?'بطاقة موسيقية أصلية':'Original music card'};
}
