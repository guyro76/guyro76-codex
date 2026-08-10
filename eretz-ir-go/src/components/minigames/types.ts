export interface MiniGameProps {
  /** מילים מהמאגר של המשחק — משמשות במשימות שצריכות אוצר מילים */
  words: string[];
  /** נקרא בסיום. progress בין 0 ל-1 קובע בונוס מלא או חלקי. */
  onDone: (progress: number) => void;
  /** דילוג — בלי בונוס ובלי עונש */
  onSkip: () => void;
}
