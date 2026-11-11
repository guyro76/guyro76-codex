import { DAILY_TIPS } from "@/lib/daily-tips";

type DailyTip = (typeof DAILY_TIPS)[0];

export function formatTipForTelegram(tip: DailyTip): string {
  const date = new Date().toLocaleDateString("he-IL");
  return `<b>${tip.icon} ${tip.title}</b>

${tip.description}

<i>טיפ יומי | ${date}</i>`;
}

export function formatTipForWhatsApp(tip: DailyTip): string {
  const date = new Date().toLocaleDateString("he-IL");
  return `📌 *${tip.title}*

${tip.description}

_טיפ יומי | ${date}_`;
}

export function formatTipForEmail(tip: DailyTip): string {
  const date = new Date().toLocaleDateString("he-IL");
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>טיפ יומי</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      direction: rtl;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h2 {
      color: #333;
      margin-top: 0;
      font-size: 24px;
    }
    p {
      color: #555;
      line-height: 1.6;
      font-size: 16px;
    }
    .footer {
      color: #999;
      font-size: 12px;
      margin-top: 20px;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>${tip.icon} ${tip.title}</h2>
    <p>${tip.description}</p>
    <div class="footer">
      טיפ יומי | ${date}
    </div>
  </div>
</body>
</html>`;
}
