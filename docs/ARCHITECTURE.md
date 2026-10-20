# KindLoop — ארכיטקטורה ומצב פרודקשן

נכון ל־20 באוקטובר 2026. סקירה לפי הקוד החי, השרת ב־Render והאתר ב־Vercel.

## תשובות קצרות

| שאלה | תשובה |
|------|--------|
| האם משתמשים חדשים יכולים להירשם? | **כן בזרימה**, בתנאי ששליחת המייל בפרודקשן מחוברת. אחרי הרשמה נדרש קוד אימות במייל. עסקים ונהגים גם משלימים פרופיל וממתינים לאישור אדמין. |
| האם המיילים עובדים? | **העוזר בגוגל עובד** (נבדק — החזיר `ok`). Gmail SMTP מ־Render **חסום**. אם `MAIL_WEBHOOK_URL` לא נשמר ב־Render, הרשמה בפרודקשן עדיין תיכשל אחרי יצירת המשתמש. |
| האם להחליף צבעים? | **לא.** הירוק `#359364` והכתום `#f97316` מתאימים למותג תרומות. מה שחסר זה תמונות אמיתיות, פיד חי, ומיקרו־אינטראקציות — לא פלטת צבעים חדשה. |
| האם מוכן לפרודקשן מושלם? | **לא עדיין.** יש מוצר אמיתי שעובד כדמו. לפני משתמשים אמיתיים חובה: מייל HTTPS ב־Render, אחסון קבצים בענן, ווובהוק Stripe, וטיפול ב־cold start. |

---

## 1. מה זה KindLoop

פלטפורמה שמחברת תורמים (אנשים ועסקים), מבקשים, ונהגים מתנדבים. תרומות פיזיות (מזון, בגדים, רהיטים וכו') עוברות מחזור חיים: יצירה → בקשה → אישור → שיוך נהג → משלוח. יש גם תרומה כספית ב־Stripe, דירוגים, והתראות בזמן אמת.

תפקידים: `user`, `business`, `driver`, `admin`.

---

## 2. מפת מערכת

```
דפדפן
  │
  ├─ Vercel  https://kindloop-one.vercel.app
  │     Vite + React 18 + MUI + Tailwind
  │     VITE_API_URL → https://kindloop-api.onrender.com/api
  │
  └─ Render  https://kindloop-api.onrender.com     (חי, GET /health = OK)
        Express + Socket.IO + JWT
        │
        ├─ MongoDB Atlas  (cluster0, DB: kindloop)
        ├─ מייל HTTPS     Resend / Brevo / MAIL_WEBHOOK (Apps Script)
        │                 SMTP Gmail בפרודקשן לא בשימוש — Render חוסם
        ├─ Stripe         אופציונלי; אין webhook
        ├─ דיסק מקומי     /uploads  (זמני ב־Render)
        └─ AI FastAPI     pythonBackend — לא בפריסה
```

| שכבה | איפה | סטטוס |
|------|------|--------|
| Frontend | Vercel Hobby, root `frontend` | Live |
| API | Render Free, Frankfurt, root `backend` | Live (`/health` OK) |
| DB | MongoDB Atlas | מחובר; משתמשים חדשים נשמרים |
| מייל | Google Apps Script webhook | הוכח מקומית; חייב env ב־Render |
| AI / TTS / תמלול | FastAPI ב־`pythonBackend` | לא בפרודקשן → TTS 503 |
| תשלומים | Stripe | כבוי בלי מפתח / בלי webhook |

---

## 3. Backend (`backend/`)

- Node 20, Express, TypeScript → build ב־esbuild (`dist/server.js`)
- MongoDB (Mongoose), Socket.IO, JWT access+refresh, Helmet, CORS, rate limit על auth
- קבצים תחת `backend/src/features/*` — מודול לכל תחום

### נתיבי API (`/api`)

| מודול | תפקיד |
|--------|--------|
| `auth` | הרשמה, התחברות, רענון טוקן, אימות מייל, איפוס סיסמה |
| `users` | פרופיל, השלמת פרופיל, העלאות, אישור/השעיה |
| `donations` | תרומות פיזיות לכל מחזור החיים |
| `requests` | בקשות עזרה ומילוי |
| `payments` | תרומות כספיות Stripe + יתרת מערכת |
| `notifications` | התראות in-app |
| `ratings` | דירוג אחרי מסירה |
| `roles` / `permissions` | RBAC |
| `activities` | פיד פעילות |
| `statistics` | סטטיסטיקות |
| `address` | השלמת כתובת (ציבורי) |
| `translate` / `tts` / `ai` | תרגום, דיבור, תמלול (תלוי במיקרו־שירות) |
| `admin` | סטטיסטיקות אדמין; חלק מהמסכים עדיין stub |

הרשאות אפקטיביות: הרשאות התפקיד + granted − denied. אדמין נוצר מ־`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` אם הוגדרו.

### הרשמה ואימות מייל

1. בדיקת אימייל/טלפון כפולים  
2. `assertEmailReadyForProduction()` — בפרודקשן חייב Resend / Brevo / `MAIL_WEBHOOK_URL` **או** SMTP (SMTP נספר כ־configured אבל **לא נשלח** מ־Render)  
3. יצירת משתמש עם קוד 6 ספרות ל־15 דקות, `isEmailVerified: false`  
4. שליחת מייל  
5. `201` + `needsEmailVerification: true` — בלי טוקנים  

אם המייל נכשל **אחרי** יצירת המשתמש → `502`, והמשתמש נשאר ב־DB בלי אימות.

סדר שליחה: Resend → Brevo → `MAIL_WEBHOOK_URL` → SMTP רק ב־dev.

הפרונט שולח `roleKey` (`user` / `business` / `driver`) — זה עובד. ב־routes יש ולידציה ישנה ל־`role` שלא בשימוש.

---

## 4. Frontend (`frontend/`)

- Vite, React 18, React Router 6, TanStack Query, Zustand (auth), react-hook-form + zod  
- i18n: עברית + אנגלית, RTL דרך `dir` + MUI `direction`  
- עיצוב כפול: **MUI** לרכיבים, **Tailwind** לעזרים (`preflight: false`)

### מסלולים עיקריים

שיווק: `/` `/how-it-works` `/about` `/contact` `/faq` `/community` + משפטי  
אורח: `/login` `/register` `/forgot-password` `/reset-password/:token`  
משפך: `/verify-email` `/complete-profile`  
מוגן: דשבורד, פרופיל, תרומות, בקשות, משלוחים, התראות, אדמין

### עיצוב נוכחי

| אסימון | ערך | הערה |
|--------|------|------|
| Primary | `#359364` / `#24754f` | ירוק KindLoop — נכון למותג |
| Secondary | `#f97316` | כתום CTA — ניגוד טוב |
| רקע | `#f8fafc` | slate בהיר, נקי |
| טקסט | `#1e293b` / `#64748b` | קריא |
| פונטים | Inter / Poppins / Rubik (עברית) | מתאים ל־RTL |

**לא להחליף את הפלטה.** הירוק משדר אמון ותרומה; הכתום דוחף לפעולה. החלפה עכשיו תשבור עקביות בלי להפוך את האפליקציה ל״ממכרת״.

מה שכן לשפר בעיצוב (בלי מותג חדש):

- Hero עם אייקון שקוף במקום תמונות תרומות אמיתיות  
- ריקנות (empty states) יבשות  
- מעט חגיגה אחרי מסירה/דירוג  
- MUI+Tailwind יוצרים סגנון לא אחיד בחלק מהמסכים  

---

## 5. מיקרו־שירות AI (`pythonBackend/`)

FastAPI: health + תמלול קול. מ־Node מופעל גם generate-description ו־TTS. **לא רץ ב־Render** — לכן TTS בפרודקשן נכשל (נראה 503 בלוגים).

---

## 6. פריסה

- `frontend/vercel.json` — SPA rewrite  
- `render.yaml` — Node Free, Frankfurt, `npm install && npm run build`  
- ב־blueprint עדיין מוגדר SMTP ל־Gmail; חסרים `MAIL_WEBHOOK_*` / `RESEND_API_KEY` / `BREVO_API_KEY` ב־yaml  

כתובות חיות:

- אתר: https://kindloop-one.vercel.app  
- API: https://kindloop-api.onrender.com  

---

## 7. קריטי לשפר לפני משתמשים אמיתיים

### חובה (חוסם אמון / כסף / מייל)

1. **מייל בפרודקשן** — להוסיף ב־Render `MAIL_WEBHOOK_URL` + `MAIL_WEBHOOK_SECRET` (או Resend/Brevo) ולפרוס מחדש. בלי זה הרשמה/איפוס סיסמה נכשלים.  
2. **קבצים בענן (Cloudinary) — דחוי להמשך.** בלי זה אסור להעלות תמונת פרופיל או מסמכי אימות בפרודקשן (העלאה תחזיר 503). הרשמה, התחברות ומייל לא תלויים בזה. כשיהיה: `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` ב-Render.  
3. **Stripe webhook** — כרגע האישור תלוי בקריאה מהלקוח אחרי PaymentIntent.  
4. **סודות שדלפו בצ׳אט** — סיסמת Atlas, App Password של Gmail, JWT מקומי: לסובב.  
5. **אדמין בפרודקשן** — `ADMIN_SEED_EMAIL` + סיסמה ארוכה, או שאין אדמין.  

### חשוב

6. Cold start ב־Render Free — משתמש ראשון מחכה עשרות שניות. לשקול Instance בתשלום.  
7. לפרוס AI או לכבות TTS/תמלול ב־UI עד שיהיה שירות.  
8. Rate limit גלובלי (כרגע רק auth).  
9. מפתחות הרשאה בסטטיסטיקות (`users:read`) לא תואמים ל־seed (`users.view`).  
10. חלק ממסכי ״שלי״ לא עטופים ב־`ProtectedRoute`.  
11. שידור `donation:status` מכל לקוח מחובר (נתיב ישן).  

### מוצר ״ממכר״ (אחרי שהבסיס יציב)

12. פיד מותאם + ״לידי״ / מפה, לא רק רשימה.  
13. הוכחות חברתיות: סטריקים, כרטיסי שיתוף, מונה השפעה חי.  
14. צ׳אט קצר בין תורם–מבקש–נהג (לא רק סטטוס).  
15. הקלת אונבורדינג: אימות מייל כן; אישור אדמין רק לעסקים/נהגים, לא לכל תורם מזדמן.  
16. AI ליצירת תיאור — המפתחות ב־i18n קיימים, ה־UI לא מחובר.  

---

## 8. האם ההרשמה עובדת בפועל

| שלב | מצב |
|------|------|
| טופס פרונט (שם, טלפון, תפקיד, סיסמה) | עובד, שולח `roleKey` |
| שמירה ב־Atlas | עבד בפרודקשן (נרשמים נשמרו גם כשהמייל נכשל) |
| מייל אימות מ־Render דרך SMTP | נכשל — timeout 587 ו־465 |
| מייל דרך Apps Script | עובד כשקוראים ל־webhook ישירות |
| חיבור Render → webhook | תלוי אם נשמרו המשתנים אחרי 18.10 |

אחרי הרשמה מוצלחת עם מייל: קוד 6 ספרות → סטטוס `active`. עסק/נהג: השלמת פרופיל + מסמכים → המתנה לאדמין.

---

## 9. האם המיילים עובדים

- **מקומית (dev):** SMTP של Gmail או לוג בלבד.  
- **פרודקשן Render + SMTP:** לא.  
- **Apps Script (`doPost` + `MailApp`):** כן, אחרי אישור Gmail — תשובה `ok` למייל בדיקה.  
- **איפוס סיסמה:** אותו צינור; קישור נבנה מ־`FRONTEND_URL` (ב־Render כבר היה `https://kindloop-one.vercel.app`).  

עד ש־Render שולח ל־webhook, משתמשים חדשים בפרודקשן **לא יקבלו** קוד אימות.

---

## 10. המלצת סדר עבודה לפרודקשן

1. לוודא ב־Render את `MAIL_WEBHOOK_URL` + `MAIL_WEBHOOK_SECRET` ולפרוס.  
2. הרשמת ניסיון באתר החי + בדיקת ספאם.  
3. לסובב סודות שדלפו.  
4. Cloudinary/S3 להעלאות.  
5. Stripe webhook אם פותחים תשלום אמיתי.  
6. Instance Render שאינו Free אם יש תנועה.  
7. רק אז: פיד, מפה, גיימיפיקציה.

הארכיטקטורה עצמה (פיצ׳רים לפי תחום, RBAC, JWT, עברית/RTL) נכונה לפרויקט מהסוג הזה. מה שחסר זה תשתית פרודקשן ותחושת מוצר חיה — לא שכתוב מהיסוד.
