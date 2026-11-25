# חיבור Postwave ל-Claude Code, Codex, ChatGPT ו-Claude

Postwave חושף את עצמו כשרת MCP. כל כלי AI שתומך ב-MCP יכול ליצור תוכן, לנתח GEO
ולפרסם — ישירות מהצ'אט, בלי להיכנס לאתר.

## מה אפשר לעשות מהצ'אט

| כלי | מה הוא עושה |
|---|---|
| `postwave_create_content` | יוצר קרוסלה / פוסט / סטורי / מצגת / תסריט רילס מנושא |
| `postwave_geo_score` | נותן ציון 0–100 לסיכוי שהתוכן יצוטט על ידי מנועי AI |
| `postwave_geo_optimize` | מבנה את התוכן מחדש לציטוט + מייצר JSON-LD ו-FAQ |
| `postwave_trends` | מביא כותרות חמות מהחדשות כנושאים לתוכן |
| `postwave_publish` | מפרסם לאינסטגרם / פייסבוק / לינקדאין / טיקטוק |

---

## 1. Claude Code

הדרך הקצרה — פקודה אחת בטרמינל:

```bash
claude mcp add postwave -- node /נתיב/מלא/אל/guyro76-codex/mcp/postwave-mcp.mjs
```

או ידנית, בקובץ `.mcp.json` בתיקיית הפרויקט:

```json
{
  "mcpServers": {
    "postwave": {
      "command": "node",
      "args": ["/נתיב/מלא/אל/guyro76-codex/mcp/postwave-mcp.mjs"],
      "env": {
        "POSTWAVE_URL": "https://guyro76-codex.vercel.app"
      }
    }
  }
}
```

אחר כך, בצ'אט פשוט תכתוב: *"תייצר לי קרוסלה על שיווק בוואטסאפ"*.

## 2. Codex

בקובץ `~/.codex/config.toml`:

```toml
[mcp_servers.postwave]
command = "node"
args = ["/נתיב/מלא/אל/guyro76-codex/mcp/postwave-mcp.mjs"]

[mcp_servers.postwave.env]
POSTWAVE_URL = "https://guyro76-codex.vercel.app"
```

## 3. Claude Desktop

בקובץ ההגדרות (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "postwave": {
      "command": "node",
      "args": ["/נתיב/מלא/אל/guyro76-codex/mcp/postwave-mcp.mjs"],
      "env": { "POSTWAVE_URL": "https://guyro76-codex.vercel.app" }
    }
  }
}
```

## 4. ChatGPT (Developer Mode)

ChatGPT מתחבר ישירות לכתובת — בלי להתקין כלום:

1. Settings → Connectors → Advanced → Developer mode.
2. Create connector.
3. **MCP Server URL**: `https://guyro76-codex.vercel.app/api/mcp`
4. **Authentication**: אם הגדרת `POSTWAVE_API_KEY`, בחר Bearer token והדבק אותו.

## 5. Claude.ai (קונקטור מותאם)

אותו דבר, בלי התקנה:

1. Settings → Connectors → Add custom connector.
2. **URL**: `https://guyro76-codex.vercel.app/api/mcp`
3. אם הגדרת מפתח — הדבק אותו כ-Bearer token.

---

## אבטחה

הגדר משתנה סביבה `POSTWAVE_API_KEY` בשרת:

```
POSTWAVE_API_KEY=בחר-מחרוזת-ארוכה-ואקראית
```

- **כשהמפתח מוגדר**: כל קריאה חייבת לשלוח אותו (`Authorization: Bearer ...`).
- **כשאין מפתח**: הכלים שיוצרים תוכן פתוחים, אבל `postwave_publish` חסום —
  כדי שאף אחד לא יוכל לפרסם בשמך בלי הרשאה.

פרסום הוא פעולה ציבורית אמיתית. תמיד אשר את הטקסט ואת הרשתות לפני שליחה.

---

## בדיקה מהירה

```bash
# שרת מקומי
POSTWAVE_URL=http://localhost:3000 node mcp/postwave-mcp.mjs

# בדיקת הכתובת המרוחקת
curl https://guyro76-codex.vercel.app/api/mcp
```

ה-GET מחזיר את רשימת הכלים ואת גרסאות הפרוטוקול הנתמכות.
