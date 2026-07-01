import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "כניסה למערכת",
  description: "כניסה מאובטחת למערכת אורגנו באמצעות Google או דוא״ל וסיסמה.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <Suspense fallback={<main className="login-page"><section className="login-card">טוען...</section></main>}><LoginForm /></Suspense>;
}
