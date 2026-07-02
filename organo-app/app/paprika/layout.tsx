import type { Metadata } from "next";
import "../../paprika-app/app/globals.css";
import "./paprika-route.css";

export const metadata: Metadata = {
  title: "פפריקה - מערכת ניהול סוכנות PPC",
  description: "מערכת מקצועית לניהול, בדיקה ואופטימיזציה של קמפיינים ב-Google Ads וב-Meta Ads.",
  robots: { index: false, follow: false },
};

export default function PaprikaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
