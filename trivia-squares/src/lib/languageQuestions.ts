// Curated starter questions for the language-learning category.
// Pronunciations in Hebrew are approximations; Latin spellings are authoritative.
export type LanguageQuestion={id:number;locale:'he'|'en'|'es'|'fr'|'ru'|'ar';category:string;text:string;answers:string[];correct:number;difficulty:number};
export const languageQuestions:LanguageQuestion[]=[
  {
    "id": 970000,
    "locale": "he",
    "category": "languages",
    "text": "איך אומרים שלום בספרדית?",
    "answers": [
      "הולה (Hola)",
      "גרסיאס (Gracias)",
      "אדיוס (Adiós)",
      "פור פאבור (Por favor)"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 970001,
    "locale": "he",
    "category": "languages",
    "text": "איך אומרים תודה בצרפתית?",
    "answers": [
      "בונז'ור (Bonjour)",
      "מרסי (Merci)",
      "או רבואר (Au revoir)",
      "סיל וו פלה (S'il vous plaît)"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 970002,
    "locale": "he",
    "category": "languages",
    "text": "איך אומרים בוקר טוב באיטלקית?",
    "answers": [
      "בואונה נוטה (Buona notte)",
      "צ'או (Ciao)",
      "בונג'ורנו (Buongiorno)",
      "גרציה (Grazie)"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 970003,
    "locale": "en",
    "category": "languages",
    "text": "How do you say hello in Spanish?",
    "answers": [
      "Hola",
      "Gracias",
      "Adiós",
      "Por favor"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 970004,
    "locale": "en",
    "category": "languages",
    "text": "How do you say thank you in French?",
    "answers": [
      "Bonjour",
      "Merci",
      "Au revoir",
      "Bonsoir"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 970005,
    "locale": "en",
    "category": "languages",
    "text": "How do you say good morning in Italian?",
    "answers": [
      "Buona notte",
      "Ciao",
      "Buongiorno",
      "Grazie"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 970006,
    "locale": "es",
    "category": "languages",
    "text": "¿Cómo se dice «gracias» en francés?",
    "answers": [
      "Bonjour",
      "Merci",
      "Au revoir",
      "Bonsoir"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 970007,
    "locale": "es",
    "category": "languages",
    "text": "¿Cómo se dice «hola» en italiano?",
    "answers": [
      "Grazie",
      "Arrivederci",
      "Ciao",
      "Buonanotte"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 970008,
    "locale": "es",
    "category": "languages",
    "text": "¿Cómo se dice «buenos días» en inglés?",
    "answers": [
      "Good night",
      "Thank you",
      "Good morning",
      "Goodbye"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 970009,
    "locale": "fr",
    "category": "languages",
    "text": "Comment dit-on « bonjour » en espagnol ?",
    "answers": [
      "Gracias",
      "Hola",
      "Adiós",
      "Por favor"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 970010,
    "locale": "fr",
    "category": "languages",
    "text": "Comment dit-on « merci » en anglais ?",
    "answers": [
      "Hello",
      "Goodbye",
      "Please",
      "Thank you"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 970011,
    "locale": "fr",
    "category": "languages",
    "text": "Comment dit-on « bonne nuit » en italien ?",
    "answers": [
      "Buona notte",
      "Buongiorno",
      "Grazie",
      "Ciao"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 970012,
    "locale": "ru",
    "category": "languages",
    "text": "Как сказать «привет» по-испански?",
    "answers": [
      "Gracias",
      "Adiós",
      "Hola",
      "Por favor"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 970013,
    "locale": "ru",
    "category": "languages",
    "text": "Как сказать «спасибо» по-французски?",
    "answers": [
      "Bonjour",
      "Merci",
      "Bonsoir",
      "Au revoir"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 970014,
    "locale": "ru",
    "category": "languages",
    "text": "Как сказать «доброе утро» по-английски?",
    "answers": [
      "Good night",
      "Good morning",
      "Goodbye",
      "Thank you"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 970015,
    "locale": "ar",
    "category": "languages",
    "text": "كيف نقول «مرحبًا» بالإسبانية؟",
    "answers": [
      "Gracias",
      "Hola",
      "Adiós",
      "Por favor"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 970016,
    "locale": "ar",
    "category": "languages",
    "text": "كيف نقول «شكرًا» بالفرنسية؟",
    "answers": [
      "Bonjour",
      "Bonsoir",
      "Merci",
      "Au revoir"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 970017,
    "locale": "ar",
    "category": "languages",
    "text": "كيف نقول «صباح الخير» بالإنجليزية؟",
    "answers": [
      "Good night",
      "Thank you",
      "Good morning",
      "Goodbye"
    ],
    "correct": 2,
    "difficulty": 3
  }
];
