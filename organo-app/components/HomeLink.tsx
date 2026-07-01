"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";

export default function HomeLink() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Link href="/" className="chrome-button home"><Home /> דף הבית</Link>;
}
