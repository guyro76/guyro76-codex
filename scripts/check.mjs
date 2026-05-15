import { readFile } from "node:fs/promises";

const files = ["src/index.html", "src/app.js", "src/styles.css", "prisma/schema.prisma"];
const required = [
  "INSTAWATCHER",
  "OAuth רשמי",
  "לא שומרים את סיסמת האינסטגרם",
  "הפעולה אינה נתמכת דרך API רשמי",
  "זוהו סימנים אפשריים בלבד",
  "נתוני אינטראקציה מלאים אינם זמינים",
  "users",
  "auth_accounts",
  "instagram_connections",
  "relationship_results"
];
const corpus = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
const missing = required.filter((needle) => !corpus.includes(needle));
if (missing.length) {
  console.error(`Missing required content: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("Static validation passed for INSTAWATCHER safety copy, schema, and app shell.");
