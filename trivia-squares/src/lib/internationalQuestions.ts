/** Curated seed bank for Russian, French and Arabic. No runtime translation or paid API.
 * Review each locale with native speakers before public competitive launch.
 */
export type InternationalQuestion={
  id:number;locale:'ru'|'fr'|'ar'|'es';category:string;text:string;answers:string[];correct:number;difficulty:number;
};
export const internationalQuestions:InternationalQuestion[]=[
  {
    "id": 300000,
    "locale": "ru",
    "category": "География",
    "text": "Какой город является столицей Франции?",
    "answers": [
      "Париж",
      "Лион",
      "Марсель",
      "Ницца"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 301000,
    "locale": "fr",
    "category": "Géographie",
    "text": "Quelle est la capitale de la France ?",
    "answers": [
      "Paris",
      "Lyon",
      "Marseille",
      "Nice"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 302000,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "ما عاصمة فرنسا؟",
    "answers": [
      "باريس",
      "ليون",
      "مرسيليا",
      "نيس"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 300001,
    "locale": "ru",
    "category": "География",
    "text": "В какой стране находится Колизей?",
    "answers": [
      "Франция",
      "Италия",
      "Греция",
      "Испания"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 301001,
    "locale": "fr",
    "category": "Géographie",
    "text": "Dans quel pays se trouve le Colisée ?",
    "answers": [
      "France",
      "Italie",
      "Grèce",
      "Espagne"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 302001,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "في أي بلد يقع الكولوسيوم؟",
    "answers": [
      "فرنسا",
      "إيطاليا",
      "اليونان",
      "إسبانيا"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 300002,
    "locale": "ru",
    "category": "География",
    "text": "В какой стране находится гора Фудзи?",
    "answers": [
      "Непал",
      "Индия",
      "Япония",
      "Китай"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 301002,
    "locale": "fr",
    "category": "Géographie",
    "text": "Dans quel pays se trouve le mont Fuji ?",
    "answers": [
      "Népal",
      "Inde",
      "Japon",
      "Chine"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 302002,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "في أي بلد يقع جبل فوجي؟",
    "answers": [
      "نيبال",
      "الهند",
      "اليابان",
      "الصين"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 300003,
    "locale": "ru",
    "category": "География",
    "text": "На каком континенте находится Бразилия?",
    "answers": [
      "Африка",
      "Европа",
      "Азия",
      "Южная Америка"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 301003,
    "locale": "fr",
    "category": "Géographie",
    "text": "Sur quel continent se trouve le Brésil ?",
    "answers": [
      "Afrique",
      "Europe",
      "Asie",
      "Amérique du Sud"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 302003,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "في أي قارة تقع البرازيل؟",
    "answers": [
      "أفريقيا",
      "أوروبا",
      "آسيا",
      "أمريكا الجنوبية"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 300004,
    "locale": "ru",
    "category": "География",
    "text": "Какой океан лежит к востоку от Африки?",
    "answers": [
      "Индийский",
      "Атлантический",
      "Тихий",
      "Северный Ледовитый"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 301004,
    "locale": "fr",
    "category": "Géographie",
    "text": "Quel océan se trouve à l'est de l'Afrique ?",
    "answers": [
      "Océan Indien",
      "Océan Atlantique",
      "Océan Pacifique",
      "Océan Arctique"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 302004,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "أي محيط يقع شرق أفريقيا؟",
    "answers": [
      "المحيط الهندي",
      "المحيط الأطلسي",
      "المحيط الهادئ",
      "المحيط المتجمد الشمالي"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 300005,
    "locale": "ru",
    "category": "География",
    "text": "Какая страна известна своими фьордами?",
    "answers": [
      "Таиланд",
      "Норвегия",
      "Египет",
      "Мексика"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 301005,
    "locale": "fr",
    "category": "Géographie",
    "text": "Quel pays est célèbre pour ses fjords ?",
    "answers": [
      "Thaïlande",
      "Norvège",
      "Égypte",
      "Mexique"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 302005,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "أي دولة تشتهر بمضايقها البحرية العميقة (الفيوردات)؟",
    "answers": [
      "تايلاند",
      "النرويج",
      "مصر",
      "المكسيك"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 300006,
    "locale": "ru",
    "category": "География",
    "text": "В какой стране находятся пирамиды Гизы?",
    "answers": [
      "Греция",
      "Марокко",
      "Египет",
      "Перу"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 301006,
    "locale": "fr",
    "category": "Géographie",
    "text": "Dans quel pays se trouvent les pyramides de Gizeh ?",
    "answers": [
      "Grèce",
      "Maroc",
      "Égypte",
      "Pérou"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 302006,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "في أي بلد تقع أهرامات الجيزة؟",
    "answers": [
      "اليونان",
      "المغرب",
      "مصر",
      "بيرو"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 300007,
    "locale": "ru",
    "category": "География",
    "text": "Какой город называют Большим яблоком?",
    "answers": [
      "Лондон",
      "Рим",
      "Торонто",
      "Нью-Йорк"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 301007,
    "locale": "fr",
    "category": "Géographie",
    "text": "Quelle ville est surnommée la Grosse Pomme ?",
    "answers": [
      "Londres",
      "Rome",
      "Toronto",
      "New York"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 302007,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "أي مدينة تُلقّب بالتفاحة الكبيرة؟",
    "answers": [
      "لندن",
      "روما",
      "تورونتو",
      "نيويورك"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 300008,
    "locale": "ru",
    "category": "География",
    "text": "Какова столица Канады?",
    "answers": [
      "Оттава",
      "Торонто",
      "Монреаль",
      "Ванкувер"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 301008,
    "locale": "fr",
    "category": "Géographie",
    "text": "Quelle est la capitale du Canada ?",
    "answers": [
      "Ottawa",
      "Toronto",
      "Montréal",
      "Vancouver"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 302008,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "ما عاصمة كندا؟",
    "answers": [
      "أوتاوا",
      "تورونتو",
      "مونتريال",
      "فانكوفر"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 300009,
    "locale": "ru",
    "category": "География",
    "text": "Какова столица Австралии?",
    "answers": [
      "Перт",
      "Канберра",
      "Сидней",
      "Мельбурн"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 301009,
    "locale": "fr",
    "category": "Géographie",
    "text": "Quelle est la capitale de l'Australie ?",
    "answers": [
      "Perth",
      "Canberra",
      "Sydney",
      "Melbourne"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 302009,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "ما عاصمة أستراليا؟",
    "answers": [
      "بيرث",
      "كانبرا",
      "سيدني",
      "ملبورن"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 300010,
    "locale": "ru",
    "category": "Наука",
    "text": "Какую планету называют Красной планетой?",
    "answers": [
      "Юпитер",
      "Нептун",
      "Марс",
      "Венера"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 301010,
    "locale": "fr",
    "category": "Sciences",
    "text": "Quelle planète est surnommée la planète rouge ?",
    "answers": [
      "Jupiter",
      "Neptune",
      "Mars",
      "Vénus"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 302010,
    "locale": "ar",
    "category": "العلوم",
    "text": "أي كوكب يُعرف بالكوكب الأحمر؟",
    "answers": [
      "المشتري",
      "نبتون",
      "المريخ",
      "الزهرة"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 300011,
    "locale": "ru",
    "category": "Наука",
    "text": "Какой газ нужен людям для дыхания?",
    "answers": [
      "Азот",
      "Гелий",
      "Аргон",
      "Кислород"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 301011,
    "locale": "fr",
    "category": "Sciences",
    "text": "Quel gaz est nécessaire à la respiration humaine ?",
    "answers": [
      "Azote",
      "Hélium",
      "Argon",
      "Oxygène"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 302011,
    "locale": "ar",
    "category": "العلوم",
    "text": "أي غاز يحتاجه الإنسان للتنفس؟",
    "answers": [
      "النيتروجين",
      "الهيليوم",
      "الأرغون",
      "الأكسجين"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 300012,
    "locale": "ru",
    "category": "Наука",
    "text": "Какой орган перекачивает кровь по телу?",
    "answers": [
      "Сердце",
      "Печень",
      "Желудок",
      "Лёгкие"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 301012,
    "locale": "fr",
    "category": "Sciences",
    "text": "Quel organe pompe le sang dans le corps ?",
    "answers": [
      "Cœur",
      "Foie",
      "Estomac",
      "Poumons"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 302012,
    "locale": "ar",
    "category": "العلوم",
    "text": "أي عضو يضخ الدم في الجسم؟",
    "answers": [
      "القلب",
      "الكبد",
      "المعدة",
      "الرئتان"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 300013,
    "locale": "ru",
    "category": "Наука",
    "text": "Как называется ближайшая к Земле звезда?",
    "answers": [
      "Вега",
      "Солнце",
      "Сириус",
      "Полярная звезда"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 301013,
    "locale": "fr",
    "category": "Sciences",
    "text": "Quelle est l'étoile la plus proche de la Terre ?",
    "answers": [
      "Véga",
      "Soleil",
      "Sirius",
      "Étoile polaire"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 302013,
    "locale": "ar",
    "category": "العلوم",
    "text": "ما أقرب نجم إلى الأرض؟",
    "answers": [
      "النسر الواقع",
      "الشمس",
      "الشعرى اليمانية",
      "النجم القطبي"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 300014,
    "locale": "ru",
    "category": "Наука",
    "text": "Какое вещество обычно замерзает при 0 °C при нормальном давлении?",
    "answers": [
      "Ртуть",
      "Морская вода",
      "Чистая вода",
      "Этанол"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 301014,
    "locale": "fr",
    "category": "Sciences",
    "text": "Quelle substance gèle normalement à 0 °C à pression standard ?",
    "answers": [
      "Mercure",
      "Eau de mer",
      "Eau pure",
      "Éthanol"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 302014,
    "locale": "ar",
    "category": "العلوم",
    "text": "أي مادة تتجمد عادة عند صفر مئوي في الضغط الجوي العادي؟",
    "answers": [
      "الزئبق",
      "ماء البحر",
      "الماء النقي",
      "الإيثانول"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 300015,
    "locale": "ru",
    "category": "Наука",
    "text": "Какой орган отвечает за мышление и память?",
    "answers": [
      "Сердце",
      "Почки",
      "Селезёнка",
      "Мозг"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 301015,
    "locale": "fr",
    "category": "Sciences",
    "text": "Quel organe est responsable de la pensée et de la mémoire ?",
    "answers": [
      "Cœur",
      "Reins",
      "Rate",
      "Cerveau"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 302015,
    "locale": "ar",
    "category": "العلوم",
    "text": "أي عضو مسؤول عن التفكير والذاكرة؟",
    "answers": [
      "القلب",
      "الكليتان",
      "الطحال",
      "الدماغ"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 300016,
    "locale": "ru",
    "category": "Наука",
    "text": "Как называется путь Земли вокруг Солнца?",
    "answers": [
      "Орбита",
      "Меридиан",
      "Экватор",
      "Атмосфера"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 301016,
    "locale": "fr",
    "category": "Sciences",
    "text": "Comment appelle-t-on la trajectoire de la Terre autour du Soleil ?",
    "answers": [
      "Orbite",
      "Méridien",
      "Équateur",
      "Atmosphère"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 302016,
    "locale": "ar",
    "category": "العلوم",
    "text": "ماذا يُسمّى مسار الأرض حول الشمس؟",
    "answers": [
      "المدار",
      "خط الطول",
      "خط الاستواء",
      "الغلاف الجوي"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 300017,
    "locale": "ru",
    "category": "Наука",
    "text": "Какой прибор измеряет температуру?",
    "answers": [
      "Микроскоп",
      "Термометр",
      "Барометр",
      "Компас"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 301017,
    "locale": "fr",
    "category": "Sciences",
    "text": "Quel instrument mesure la température ?",
    "answers": [
      "Microscope",
      "Thermomètre",
      "Baromètre",
      "Boussole"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 302017,
    "locale": "ar",
    "category": "العلوم",
    "text": "أي جهاز يقيس درجة الحرارة؟",
    "answers": [
      "المجهر",
      "مقياس الحرارة",
      "مقياس الضغط",
      "البوصلة"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 300018,
    "locale": "ru",
    "category": "Природа",
    "text": "Какое животное является самым большим наземным млекопитающим?",
    "answers": [
      "Носорог",
      "Жираф",
      "Африканский слон",
      "Бегемот"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 301018,
    "locale": "fr",
    "category": "Nature",
    "text": "Quel animal est le plus grand mammifère terrestre ?",
    "answers": [
      "Rhinocéros",
      "Girafe",
      "Éléphant d'Afrique",
      "Hippopotame"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 302018,
    "locale": "ar",
    "category": "الطبيعة",
    "text": "ما أكبر الثدييات البرية؟",
    "answers": [
      "وحيد القرن",
      "الزرافة",
      "الفيل الأفريقي",
      "فرس النهر"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 300019,
    "locale": "ru",
    "category": "Природа",
    "text": "Какая птица не умеет летать и живёт в Антарктике?",
    "answers": [
      "Орёл",
      "Аист",
      "Попугай",
      "Пингвин"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 301019,
    "locale": "fr",
    "category": "Nature",
    "text": "Quel oiseau incapable de voler vit en Antarctique ?",
    "answers": [
      "Aigle",
      "Cigogne",
      "Perroquet",
      "Manchot"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 302019,
    "locale": "ar",
    "category": "الطبيعة",
    "text": "أي طائر لا يطير ويعيش في القارة القطبية الجنوبية؟",
    "answers": [
      "النسر",
      "اللقلق",
      "الببغاء",
      "البطريق"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 300020,
    "locale": "ru",
    "category": "Природа",
    "text": "Какое животное известно чёрно-белыми полосами?",
    "answers": [
      "Зебра",
      "Лев",
      "Гепард",
      "Слон"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 301020,
    "locale": "fr",
    "category": "Nature",
    "text": "Quel animal est connu pour ses rayures noires et blanches ?",
    "answers": [
      "Zèbre",
      "Lion",
      "Guépard",
      "Éléphant"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 302020,
    "locale": "ar",
    "category": "الطبيعة",
    "text": "أي حيوان يشتهر بخطوطه السوداء والبيضاء؟",
    "answers": [
      "الحمار الوحشي",
      "الأسد",
      "الفهد",
      "الفيل"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 300021,
    "locale": "ru",
    "category": "Природа",
    "text": "Что пчёлы производят из цветочного нектара?",
    "answers": [
      "Молоко",
      "Мёд",
      "Масло",
      "Уксус"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 301021,
    "locale": "fr",
    "category": "Nature",
    "text": "Que produisent les abeilles à partir du nectar des fleurs ?",
    "answers": [
      "Lait",
      "Miel",
      "Beurre",
      "Vinaigre"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 302021,
    "locale": "ar",
    "category": "الطبيعة",
    "text": "ماذا يصنع النحل من رحيق الأزهار؟",
    "answers": [
      "الحليب",
      "العسل",
      "الزبدة",
      "الخل"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 300022,
    "locale": "ru",
    "category": "Природа",
    "text": "Какой орган растения обычно поглощает воду из почвы?",
    "answers": [
      "Плод",
      "Цветок",
      "Корень",
      "Лепесток"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 301022,
    "locale": "fr",
    "category": "Nature",
    "text": "Quelle partie de la plante absorbe généralement l'eau du sol ?",
    "answers": [
      "Fruit",
      "Fleur",
      "Racine",
      "Pétale"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 302022,
    "locale": "ar",
    "category": "الطبيعة",
    "text": "أي جزء من النبات يمتص الماء عادةً من التربة؟",
    "answers": [
      "الثمرة",
      "الزهرة",
      "الجذر",
      "البتلة"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 300023,
    "locale": "ru",
    "category": "Природа",
    "text": "Как называется превращение гусеницы в бабочку?",
    "answers": [
      "Испарение",
      "Брожение",
      "Эрозия",
      "Метаморфоз"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 301023,
    "locale": "fr",
    "category": "Nature",
    "text": "Comment appelle-t-on la transformation d'une chenille en papillon ?",
    "answers": [
      "Évaporation",
      "Fermentation",
      "Érosion",
      "Métamorphose"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 302023,
    "locale": "ar",
    "category": "الطبيعة",
    "text": "ماذا يُسمّى تحول اليرقة إلى فراشة؟",
    "answers": [
      "التبخر",
      "التخمر",
      "التعرية",
      "التحول"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 300024,
    "locale": "ru",
    "category": "Еда",
    "text": "Какой фрукт известен высоким содержанием витамина C и дольками?",
    "answers": [
      "Апельсин",
      "Банан",
      "Авокадо",
      "Кокос"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 301024,
    "locale": "fr",
    "category": "Gastronomie",
    "text": "Quel fruit est connu pour sa vitamine C et ses quartiers ?",
    "answers": [
      "Orange",
      "Banane",
      "Avocat",
      "Noix de coco"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 302024,
    "locale": "ar",
    "category": "الطعام",
    "text": "أي فاكهة معروفة بفيتامين سي وفصوصها؟",
    "answers": [
      "البرتقال",
      "الموز",
      "الأفوكادو",
      "جوز الهند"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 300025,
    "locale": "ru",
    "category": "Еда",
    "text": "Из какой страны происходит блюдо суши?",
    "answers": [
      "Испания",
      "Япония",
      "Италия",
      "Бразилия"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 301025,
    "locale": "fr",
    "category": "Gastronomie",
    "text": "De quel pays vient le sushi ?",
    "answers": [
      "Espagne",
      "Japon",
      "Italie",
      "Brésil"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 302025,
    "locale": "ar",
    "category": "الطعام",
    "text": "من أي بلد يعود أصل السوشي؟",
    "answers": [
      "إسبانيا",
      "اليابان",
      "إيطاليا",
      "البرازيل"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 300026,
    "locale": "ru",
    "category": "Еда",
    "text": "Какой ингредиент традиционно является основой гуакамоле?",
    "answers": [
      "Морковь",
      "Груша",
      "Авокадо",
      "Картофель"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 301026,
    "locale": "fr",
    "category": "Gastronomie",
    "text": "Quel ingrédient est la base du guacamole ?",
    "answers": [
      "Carotte",
      "Poire",
      "Avocat",
      "Pomme de terre"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 302026,
    "locale": "ar",
    "category": "الطعام",
    "text": "ما المكوّن الأساسي للغواكامولي؟",
    "answers": [
      "الجزر",
      "الإجاص",
      "الأفوكادو",
      "البطاطا"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 300027,
    "locale": "ru",
    "category": "Еда",
    "text": "Из каких зёрен в основном готовят попкорн?",
    "answers": [
      "Рис",
      "Пшеница",
      "Овёс",
      "Кукуруза"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 301027,
    "locale": "fr",
    "category": "Gastronomie",
    "text": "Avec quelle céréale fait-on du pop-corn ?",
    "answers": [
      "Riz",
      "Blé",
      "Avoine",
      "Maïs"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 302027,
    "locale": "ar",
    "category": "الطعام",
    "text": "من أي حبوب يُصنع الفشار؟",
    "answers": [
      "الأرز",
      "القمح",
      "الشوفان",
      "الذرة"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 300028,
    "locale": "ru",
    "category": "Культура",
    "text": "Какой инструмент имеет клавиши и струны внутри корпуса?",
    "answers": [
      "Фортепиано",
      "Флейта",
      "Труба",
      "Барабан"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 301028,
    "locale": "fr",
    "category": "Culture",
    "text": "Quel instrument possède des touches et des cordes à l'intérieur ?",
    "answers": [
      "Piano",
      "Flûte",
      "Trompette",
      "Tambour"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 302028,
    "locale": "ar",
    "category": "الثقافة",
    "text": "أي آلة موسيقية لها مفاتيح وأوتار داخلها؟",
    "answers": [
      "البيانو",
      "الناي",
      "البوق",
      "الطبل"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 300029,
    "locale": "ru",
    "category": "Культура",
    "text": "Кто написал роман «Дон Кихот»?",
    "answers": [
      "Жюль Верн",
      "Мигель де Сервантес",
      "Уильям Шекспир",
      "Виктор Гюго"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 301029,
    "locale": "fr",
    "category": "Culture",
    "text": "Qui a écrit le roman « Don Quichotte » ?",
    "answers": [
      "Jules Verne",
      "Miguel de Cervantes",
      "William Shakespeare",
      "Victor Hugo"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 302029,
    "locale": "ar",
    "category": "الثقافة",
    "text": "من كتب رواية دون كيشوت؟",
    "answers": [
      "جول فيرن",
      "ميغيل دي ثيربانتس",
      "ويليام شكسبير",
      "فيكتور هوغو"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 300030,
    "locale": "ru",
    "category": "Культура",
    "text": "Как называется знаменитый музей в Париже с картиной «Мона Лиза»?",
    "answers": [
      "Уффици",
      "Метрополитен-музей",
      "Лувр",
      "Прадо"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 301030,
    "locale": "fr",
    "category": "Culture",
    "text": "Quel musée parisien abrite la Joconde ?",
    "answers": [
      "Offices",
      "Metropolitan Museum",
      "Louvre",
      "Prado"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 302030,
    "locale": "ar",
    "category": "الثقافة",
    "text": "في أي متحف في باريس تُعرض الموناليزا؟",
    "answers": [
      "أوفيزي",
      "المتروبوليتان",
      "اللوفر",
      "البرادو"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 300031,
    "locale": "ru",
    "category": "Культура",
    "text": "Какой цвет получается при смешивании синего и жёлтого пигментов?",
    "answers": [
      "Красный",
      "Фиолетовый",
      "Чёрный",
      "Зелёный"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 301031,
    "locale": "fr",
    "category": "Culture",
    "text": "Quelle couleur obtient-on en mélangeant des pigments bleus et jaunes ?",
    "answers": [
      "Rouge",
      "Violet",
      "Noir",
      "Vert"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 302031,
    "locale": "ar",
    "category": "الثقافة",
    "text": "أي لون ينتج من خلط الصبغتين الزرقاء والصفراء؟",
    "answers": [
      "الأحمر",
      "البنفسجي",
      "الأسود",
      "الأخضر"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 300032,
    "locale": "ru",
    "category": "Спорт",
    "text": "Сколько игроков одной команды находятся на поле в обычном футболе?",
    "answers": [
      "Одиннадцать",
      "Девять",
      "Семь",
      "Пятнадцать"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 301032,
    "locale": "fr",
    "category": "Sport",
    "text": "Combien de joueurs d'une équipe sont sur le terrain au football ?",
    "answers": [
      "Onze",
      "Neuf",
      "Sept",
      "Quinze"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 302032,
    "locale": "ar",
    "category": "الرياضة",
    "text": "كم لاعبًا من الفريق الواحد يكونون في الملعب بكرة القدم؟",
    "answers": [
      "أحد عشر",
      "تسعة",
      "سبعة",
      "خمسة عشر"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 300033,
    "locale": "ru",
    "category": "Спорт",
    "text": "Какой вид спорта использует ракетку и волан?",
    "answers": [
      "Гольф",
      "Бадминтон",
      "Баскетбол",
      "Гандбол"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 301033,
    "locale": "fr",
    "category": "Sport",
    "text": "Quel sport utilise une raquette et un volant ?",
    "answers": [
      "Golf",
      "Badminton",
      "Basket-ball",
      "Handball"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 302033,
    "locale": "ar",
    "category": "الرياضة",
    "text": "أي رياضة تستخدم المضرب والريشة؟",
    "answers": [
      "الغولف",
      "الريشة الطائرة",
      "كرة السلة",
      "كرة اليد"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 300034,
    "locale": "ru",
    "category": "Спорт",
    "text": "В каком виде спорта используют кольцо и мяч, который ведут рукой?",
    "answers": [
      "Хоккей",
      "Регби",
      "Баскетбол",
      "Теннис"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 301034,
    "locale": "fr",
    "category": "Sport",
    "text": "Dans quel sport dribble-t-on un ballon pour marquer dans un panier ?",
    "answers": [
      "Hockey",
      "Rugby",
      "Basket-ball",
      "Tennis"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 302034,
    "locale": "ar",
    "category": "الرياضة",
    "text": "في أي رياضة تُستخدم سلة وكرة تُنطّ باليد؟",
    "answers": [
      "الهوكي",
      "الرغبي",
      "كرة السلة",
      "التنس"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 300035,
    "locale": "ru",
    "category": "Технологии",
    "text": "Как называется устройство для перемещения курсора компьютера?",
    "answers": [
      "Принтер",
      "Микрофон",
      "Маршрутизатор",
      "Мышь"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 301035,
    "locale": "fr",
    "category": "Technologie",
    "text": "Quel appareil sert à déplacer le pointeur de l'ordinateur ?",
    "answers": [
      "Imprimante",
      "Microphone",
      "Routeur",
      "Souris"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 302035,
    "locale": "ar",
    "category": "التكنولوجيا",
    "text": "ما الجهاز الذي يُستخدم لتحريك مؤشر الحاسوب؟",
    "answers": [
      "الطابعة",
      "الميكروفون",
      "الموجّه",
      "الفأرة"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 300036,
    "locale": "ru",
    "category": "Технологии",
    "text": "Какая единица хранения данных обычно больше: гигабайт или мегабайт?",
    "answers": [
      "Гигабайт",
      "Мегабайт",
      "Килобайт",
      "Байт"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 301036,
    "locale": "fr",
    "category": "Technologie",
    "text": "Quelle unité de stockage est plus grande qu'un mégaoctet ?",
    "answers": [
      "Gigaoctet",
      "Mégaoctet",
      "Kilooctet",
      "Octet"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 302036,
    "locale": "ar",
    "category": "التكنولوجيا",
    "text": "أي وحدة تخزين أكبر من الميغابايت؟",
    "answers": [
      "الغيغابايت",
      "الميغابايت",
      "الكيلوبايت",
      "البايت"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 300037,
    "locale": "ru",
    "category": "Технологии",
    "text": "Какая технология позволяет связываться с сайтами по адресам URL?",
    "answers": [
      "NFC",
      "Всемирная паутина",
      "Bluetooth",
      "GPS"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 301037,
    "locale": "fr",
    "category": "Technologie",
    "text": "Quelle technologie permet de consulter des sites via des URL ?",
    "answers": [
      "NFC",
      "Web",
      "Bluetooth",
      "GPS"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 302037,
    "locale": "ar",
    "category": "التكنولوجيا",
    "text": "ما التقنية التي تتيح الوصول إلى المواقع عبر عناوين URL؟",
    "answers": [
      "NFC",
      "الويب",
      "بلوتوث",
      "GPS"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 300038,
    "locale": "ru",
    "category": "География",
    "text": "Какое море лежит между Европой и Северной Африкой?",
    "answers": [
      "Красное",
      "Чёрное",
      "Средиземное",
      "Балтийское"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 301038,
    "locale": "fr",
    "category": "Géographie",
    "text": "Quelle mer sépare l'Europe de l'Afrique du Nord ?",
    "answers": [
      "Rouge",
      "Noire",
      "Méditerranée",
      "Baltique"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 302038,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "أي بحر يفصل أوروبا عن شمال أفريقيا؟",
    "answers": [
      "البحر الأحمر",
      "البحر الأسود",
      "البحر الأبيض المتوسط",
      "بحر البلطيق"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 300039,
    "locale": "ru",
    "category": "География",
    "text": "Какая река протекает через Лондон?",
    "answers": [
      "Сена",
      "Дунай",
      "Рейн",
      "Темза"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 301039,
    "locale": "fr",
    "category": "Géographie",
    "text": "Quel fleuve traverse Londres ?",
    "answers": [
      "Seine",
      "Danube",
      "Rhin",
      "Tamise"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 302039,
    "locale": "ar",
    "category": "الجغرافيا",
    "text": "أي نهر يمر عبر لندن؟",
    "answers": [
      "السين",
      "الدانوب",
      "الراين",
      "التايمز"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {"id":303000,"locale":"es","category":"Geografía","text":"¿Cuál es la capital de Francia?","answers":["París","Lyon","Marsella","Niza"],"correct":0,"difficulty":1},
  {"id":303001,"locale":"es","category":"Ciencia","text":"¿Qué planeta es conocido como el planeta rojo?","answers":["Venus","Marte","Júpiter","Mercurio"],"correct":1,"difficulty":2},
  {"id":303002,"locale":"es","category":"Historia","text":"¿En qué país se construyeron las pirámides de Guiza?","answers":["México","Egipto","Perú","Grecia"],"correct":1,"difficulty":3},
  {"id":303003,"locale":"es","category":"Cine","text":"¿Qué personaje de Disney pierde un zapato de cristal?","answers":["Ariel","Cenicienta","Mulán","Elsa"],"correct":1,"difficulty":1},
  {"id":303004,"locale":"es","category":"Deportes","text":"¿Cuántos jugadores tiene un equipo de fútbol en el campo?","answers":["9","10","11","12"],"correct":2,"difficulty":2},
  {"id":303005,"locale":"es","category":"Naturaleza","text":"¿Cuál es el mamífero más grande del mundo?","answers":["Elefante africano","Ballena azul","Jirafa","Hipopótamo"],"correct":1,"difficulty":3},
  {"id":303006,"locale":"es","category":"Música","text":"¿Cuántas cuerdas tiene una guitarra clásica?","answers":["4","5","6","8"],"correct":2,"difficulty":1},
  {"id":303007,"locale":"es","category":"Literatura","text":"¿Quién escribió Don Quijote de la Mancha?","answers":["Lorca","Borges","Cervantes","Neruda"],"correct":2,"difficulty":2},
  {"id":303008,"locale":"es","category":"Geografía","text":"¿En qué continente está Brasil?","answers":["Europa","Asia","América del Sur","África"],"correct":2,"difficulty":3},
  {"id":303009,"locale":"es","category":"Ciencia","text":"¿Cuál es la fórmula química del agua?","answers":["CO₂","H₂O","O₂","NaCl"],"correct":1,"difficulty":1},
  {"id":303010,"locale":"es","category":"Historia","text":"¿En qué año llegó el ser humano a la Luna por primera vez?","answers":["1959","1969","1979","1989"],"correct":1,"difficulty":2},
  {"id":303011,"locale":"es","category":"Cine","text":"¿Qué animal es Simba en El rey león?","answers":["Tigre","León","Leopardo","Lobo"],"correct":1,"difficulty":3},
  {"id":303012,"locale":"es","category":"Deportes","text":"¿En qué deporte se usa una raqueta y un volante?","answers":["Tenis","Bádminton","Béisbol","Balonmano"],"correct":1,"difficulty":1},
  {"id":303013,"locale":"es","category":"Naturaleza","text":"¿Qué órgano bombea la sangre?","answers":["Pulmón","Cerebro","Corazón","Hígado"],"correct":2,"difficulty":2},
  {"id":303014,"locale":"es","category":"Tecnología","text":"¿Qué significa WWW en una dirección web?","answers":["World Wide Web","Web World Wire","Wide Web World","World Wireless Web"],"correct":0,"difficulty":3},
  {"id":303015,"locale":"es","category":"Geografía","text":"¿Cuál es la capital de Australia?","answers":["Sídney","Melbourne","Canberra","Perth"],"correct":2,"difficulty":1},
  {"id":303016,"locale":"es","category":"Ciencia","text":"¿Cuál es el gas más abundante en la atmósfera terrestre?","answers":["Oxígeno","Nitrógeno","Dióxido de carbono","Argón"],"correct":1,"difficulty":2},
  {"id":303017,"locale":"es","category":"Arte","text":"¿Quién pintó La noche estrellada?","answers":["Picasso","Monet","Van Gogh","Dalí"],"correct":2,"difficulty":3},
  {"id":303018,"locale":"es","category":"Cine","text":"¿Qué película de Disney incluye la canción 'Libre soy'?","answers":["Encanto","Frozen","Moana","Aladdín"],"correct":1,"difficulty":1},
  {"id":303019,"locale":"es","category":"Deportes","text":"¿Cuántos anillos tiene el símbolo olímpico?","answers":["4","5","6","7"],"correct":1,"difficulty":2},
  {"id":303020,"locale":"es","category":"Geografía","text":"¿Qué océano está al oeste de América del Sur?","answers":["Atlántico","Índico","Pacífico","Ártico"],"correct":2,"difficulty":3},
  {"id":303021,"locale":"es","category":"Historia","text":"¿En qué país nació Leonardo da Vinci?","answers":["España","Italia","Francia","Alemania"],"correct":1,"difficulty":1},
  {"id":303022,"locale":"es","category":"Naturaleza","text":"¿Qué proceso usan las plantas para producir energía a partir de la luz?","answers":["Fermentación","Fotosíntesis","Evaporación","Condensación"],"correct":1,"difficulty":2},
  {"id":303023,"locale":"es","category":"Tecnología","text":"¿Qué dispositivo se usa para mover el cursor en un ordenador?","answers":["Impresora","Ratón","Altavoz","Micrófono"],"correct":1,"difficulty":3},
  {"id":303024,"locale":"es","category":"Literatura","text":"¿Quién escribió la saga Harry Potter?","answers":["J. K. Rowling","Agatha Christie","Jane Austen","Suzanne Collins"],"correct":0,"difficulty":1},
  {"id":303025,"locale":"es","category":"Cine","text":"¿Cómo se llama el vaquero de Toy Story?","answers":["Buzz","Woody","Rex","Andy"],"correct":1,"difficulty":2},
  {"id":303026,"locale":"es","category":"Geografía","text":"¿Cuál es la capital de Japón?","answers":["Kioto","Osaka","Tokio","Nagoya"],"correct":2,"difficulty":3},
  {"id":303027,"locale":"es","category":"Ciencia","text":"¿Cuántos planetas tiene el sistema solar?","answers":["7","8","9","10"],"correct":1,"difficulty":1},
  {"id":303028,"locale":"es","category":"Historia","text":"¿Qué civilización construyó Machu Picchu?","answers":["Azteca","Inca","Maya","Romana"],"correct":1,"difficulty":2},
  {"id":303029,"locale":"es","category":"Deportes","text":"¿En qué deporte se practica el saque de esquina?","answers":["Baloncesto","Voleibol","Fútbol","Tenis"],"correct":2,"difficulty":3}
];
