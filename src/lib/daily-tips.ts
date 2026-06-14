export const DAILY_TIPS = [
  {
    id: 1,
    title: "עיתוי זהב לפוסטים",
    description: "פרסום בשעות 9-11 בבוקר וגם 6-8 בערב מגביר עלייה של 40% בהתייחסויות",
    icon: "⏰",
    category: "timing",
    impact: "high",
  },
  {
    id: 2,
    title: "כוח ה-Stories",
    description: "סטורים מקבלים 3x יותר התייחסויות מפוסטים רגילים. השתמש בהם יומיים בשבוע",
    icon: "🎬",
    category: "content",
    impact: "high",
  },
  {
    id: 3,
    title: "השאלות שמעלות עניין",
    description: "פוסטים עם שאלות בסוף מקבלים 2x יותר תגובות. בדוק זאת היום!",
    icon: "❓",
    category: "engagement",
    impact: "high",
  },
  {
    id: 4,
    title: "Hashtag Strategy",
    description: "3-5 hashtags רלוונטיים הם הדרך לקדמה. יותר מ-5 = spam, פחות מ-3 = אבדת הגעה",
    icon: "🏷️",
    category: "strategy",
    impact: "medium",
  },
  {
    id: 5,
    title: "סוג תוכן שמקבל תשומת לב",
    description: "תוכן חינוכי עדיף פי 2 על פי השקעה בעליוני. שתף ידע, לא קידום",
    icon: "📚",
    category: "content",
    impact: "high",
  },
  {
    id: 6,
    title: "התגובה הראשונה קריטית",
    description: "הגב לתגובות הראשונות תוך 30 דקות - זה אות לאלגוריתם שהפוסט משמעותי",
    icon: "💬",
    category: "engagement",
    impact: "high",
  },
  {
    id: 7,
    title: "Carousel > Single Post",
    description: "קרוסלות מקבלות 3.5x יותר שיתופים וטיוטות מפוסטים בודדים",
    icon: "📱",
    category: "format",
    impact: "very-high",
  },
  {
    id: 8,
    title: "טקסט vs תמונה",
    description: "תמונות עם טקסט קצר (10-15 מילים) עדיפות על טקסט ארוך. תמונה מספרת סיפור",
    icon: "🖼️",
    category: "content",
    impact: "high",
  },
];

export function getDailyTip(dayOfYear?: number): (typeof DAILY_TIPS)[0] {
  const day = dayOfYear || Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 365;
  return DAILY_TIPS[day % DAILY_TIPS.length];
}

export function getRandomTip(): (typeof DAILY_TIPS)[0] {
  return DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
}
