# 🔌 مرجع الـ API — البلوجنات ونماذج الاستجابة

> هذا الملف يوضّح **كل** بلوجن يعتمد على خدمة خارجية، والمسار الذي يناديه،
> والمعاملات، و**شكل الاستجابة المتوقّع** (النموذج/الـ schema) الذي يقرأه الكود.
>
> إذا بدّلت الخدمة، لازم الخدمة الجديدة ترجّع نفس الحقول، وإلا البلوجن يفشل
> حتى لو الـ API شغّال.

## ⚙️ مكان ضبط العنوان

العنوان الأساسي في **مكان واحد فقط**:

```
lib/config.js   →   const DEFAULT_API_BASE = 'https://apex-api-five.vercel.app'
```

أو بدون تعديل الملف:

```bash
API_BASE=https://my-api.example.com npm start
```

كل البلوجنات تقرأه من `global.API_BASE`. **لا تُثبّت العنوان داخل أي بلوجن.**

---

## 📋 جدول مختصر

| المسار | البلوجنات | الطريقة | أهم حقول الطلب | أهم حقول الاستجابة |
|---|---|---|---|---|
| `/api/v1/ai/gemini` | `ai-global.js`, `gemini.js`, `زوقي.js` | GET | `prompt` | `status`, `response` |
| `/api/v1/ai/claude` | `كلود.js` | GET | `message` | `response` |
| `/api/v1/ai/deepseek` | `ديب.js` | GET | `prompt` | `response`, `model` |
| `/api/v1/ai/copilot` | `كوبايلوت.js` | GET | `prompt`, `model` | `status`, `response`, `model` |
| `/api/v1/ai/AI-elevenlabs` | `اصوات.js` | GET | `voice`, `text` | `status`, `response`/`data` (رابط أو base64) |
| `/api/v1/ai/veo3pro` | `veo3.js` | GET | `prompt`, `imageUrl?` | `status`, `videoUrl` |
| `/api/v1/ai/nano_banana` | `نينو.js` | GET أو POST | `imageUrl`, `prompt` / ملف | `result` |
| `/api/v1/ai/image2figure` | `لمجسم.js` | GET | `image` | `status`, `image` |
| `/api/v1/ai/draw/text2img` | `ai-kinisiya.js` | GET | `prompt` | `status`, `message`, `imageUrl` |
| `/api/v1/ai/draw/text2vid` | `ai-kinisiya.js` | GET | `prompt` | `status`, `message`, `videoUrl` |
| `/api/v1/search/pinterest` | `بينتريست.js`, `ستيك.js`, `صور.js`, `صور_2.js`, `ملصقات.js`, `ميمز.js` | GET | `query` | `pins[]: { image }` |
| `/api/v1/search/tiktok` | `تيكتوك.js`, `ايديت-اغنيه.js`, `ايديت-سيارات.js`, `ايديت-كوره.js` | GET | `text` | `status`, `videos[]: { play }` |
| `/api/v1/search/sound_cloud` | `ساوند_بحث.js` | GET | `query` | `status`, `results[]: { title, artist, duration, likes, plays, link }` |
| `/api/v1/search/lyrics` | `كلمات.js` | GET | `text` | `status`, `title`, `artist`, `lyrics`, `message` |
| `/api/v1/search/pinlens` | `عدسه.js` | GET | `imageUrl` | `status`, `results[]` |
| `/api/v1/search/mod` | `مود.js`, `ترايد.js` | GET | `q` | `status`, `query`, `count`, `results[]: { title }` |
| `/api/v1/search/instagram` | `ريلزات.js` | GET | `query` | `results[]` |
| `/api/v1/download/YTDL` | `yts-global.js` | GET | `url`, `type`, `quality` | `status`, `data: { title, url, source }` |
| `/api/v1/download/instagram` | `ريلزات.js` | GET | `url` | كائن/رابط ميديا |
| `/api/v1/download_instagram` | `انستا.js` | GET | `url` | `status`, `media_type`, `download_url` |
| `/api/v1/download/telgram` | `تيليجرام.js` | GET | `url` | كائن/رابط ميديا |
| `/api/v1/download/mods/link` | `ترايد.js` | GET | `url` | بيانات الملف |
| `/api/v1/download/mods/file` | `ترايد.js` | GET | `url` | رابط الملف |
| `/api/v1/tools/rb` | `rembg.js` | GET | `imageUrl` | صورة/رابط |
| `/api/v1/tools/check_porn` | `مضاد-اباحية.js` | GET | `imageUrl` | `result: { labelName, confidence }` |
| `/api/v1/games/mard-start` | `مارد.js` | POST | — | `session`, `signature`, `question` |
| `/api/v1/games/mard-answer` | `مارد.js` | POST | `session`, `signature`, `step`, `progression`, `cm` | `step`, `progression`, `question`, `akitude`, `akitude_url` |
| `/api/v1/games/mard-cancel` | `مارد.js` | POST | `session`, `signature`, `step`, `progression`, `answer`, `cm`, `sid`, `question_filter` | `name_proposition`, `photo` |
| `/api/blackwave/otp` | `otp-sensor.js`, `ارسال.js` | GET | `key` | `otps[]: { number, code, time }` |

---

## 🤖 الذكاء الاصطناعي

### `/api/v1/ai/gemini`
**البلوجنات:** `ai-global.js`, `gemini.js`, `زوقي.js`
- **الطلب:** `GET /api/v1/ai/gemini?prompt=<النص>`
- **الاستجابة:** `{ "status": true, "response": "رد الذكاء الاصطناعي" }`

### `/api/v1/ai/claude`
**البلوجن:** `كلود.js`
- **الطلب:** `GET /api/v1/ai/claude?message=<النص>`
- **الاستجابة:** `{ "response": "..." }`

### `/api/v1/ai/deepseek`
**البلوجن:** `ديب.js`
- **الطلب:** `GET /api/v1/ai/deepseek?prompt=<النص>`
- **الاستجابة:** `{ "response": "...", "model": "deepseek-chat" }`

### `/api/v1/ai/copilot`
**البلوجن:** `كوبايلوت.js`
- **الطلب:** `GET /api/v1/ai/copilot?prompt=<النص>&model=<الموديل>`
- **الاستجابة:** `{ "status": true, "response": "...", "model": "..." }`

### `/api/v1/ai/AI-elevenlabs`
**البلوجن:** `اصوات.js`
- **الطلب:** `GET /api/v1/ai/AI-elevenlabs?voice=<الصوت>&text=<النص>`
- **الاستجابة:** `{ "status": true, "response": "<base64 أو رابط مباشر للصوت>" }`
  - يدعم `data.response` أو `data.data` — أي رابط مباشر يُرسل كما هو، وإلا يُفكّ كـ base64.

### `/api/v1/ai/veo3pro`
**البلوجن:** `veo3.js`
- **الطلب:** `GET /api/v1/ai/veo3pro?prompt=<الوصف>` (+ `&imageUrl=` اختياري)
- **الاستجابة:** `{ "status": true, "videoUrl": "https://..." }`

### `/api/v1/ai/nano_banana`
**البلوجن:** `نينو.js`
- **الطلب:**
  - `GET /api/v1/ai/nano_banana?imageUrl=<رابط>&prompt=<وصف>`
  - أو `POST` بصيغة multipart (ملف صورة + `prompt`)
- **الاستجابة:** `{ "result": "https://...png" }`

### `/api/v1/ai/image2figure`
**البلوجن:** `لمجسم.js`
- **الطلب:** `GET /api/v1/ai/image2figure?image=<رابط>`
- **الاستجابة:** `{ "status": true, "image": "https://..." }`

### `/api/v1/ai/draw/text2img` و `.../text2vid`
**البلوجن:** `ai-kinisiya.js`
- **الطلب:** `GET /api/v1/ai/draw/text2img?prompt=<الوصف>`
- **الاستجابة:** `{ "status": true, "message": "...", "imageUrl": "https://..." }`

---

## 🔎 البحث

### `/api/v1/search/pinterest`
**البلوجنات:** `بينتريست.js`, `ستيك.js`, `صور.js`, `صور_2.js`, `ملصقات.js`, `ميمز.js`
- **الطلب:** `GET /api/v1/search/pinterest?query=<الكلمة>`
- **الاستجابة:** `{ "pins": [ { "image": "https://..." } ] }`

### `/api/v1/search/tiktok`
**البلوجنات:** `تيكتوك.js`, `ايديت-اغنيه.js`, `ايديت-سيارات.js`, `ايديت-كوره.js`
- **الطلب:** `GET /api/v1/search/tiktok?text=<الكلمة>`
- **الاستجابة:** `{ "status": true, "videos": [ { "play": "https://..." } ] }`

### `/api/v1/search/sound_cloud`
**البلوجن:** `ساوند_بحث.js`
- **الطلب:** `GET /api/v1/search/sound_cloud?query=<الكلمة>`
- **الاستجابة:**
  ```json
  { "status": true,
    "results": [ { "title": "...", "artist": "...", "duration": "...", "likes": 0, "plays": 0, "link": "https://..." } ] }
  ```

### `/api/v1/search/lyrics`
**البلوجن:** `كلمات.js`
- **الطلب:** `GET /api/v1/search/lyrics?text=<اسم الأغنية>`
- **الاستجابة:** `{ "status": true, "title": "...", "artist": "...", "lyrics": "...", "message": "..." }`

### `/api/v1/search/pinlens`
**البلوجن:** `عدسه.js`
- **الطلب:** `GET /api/v1/search/pinlens?imageUrl=<رابط>`
- **الاستجابة:** `{ "status": true, "results": [ "https://..." ] }`

### `/api/v1/search/mod`
**البلوجنات:** `مود.js`, `ترايد.js`
- **الطلب:** `GET /api/v1/search/mod?q=<الكلمة>`
- **الاستجابة:** `{ "status": true, "query": "...", "count": 5, "results": [ { "title": "..." } ] }`

### `/api/v1/search/instagram`
**البلوجن:** `ريلزات.js`
- **الطلب:** `GET /api/v1/search/instagram?query=<الكلمة>`
- **الاستجابة:** `{ "results": [ ... ] }`

---

## 📥 التنزيل

### `/api/v1/download/YTDL`
**البلوجن:** `yts-global.js`
- **الطلب:** `GET /api/v1/download/YTDL?url=<رابط>&type=audio|video&quality=<الجودة>`
- **الاستجابة:** `{ "status": true, "data": { "title": "...", "url": "https://...", "source": "..." } }`

### `/api/v1/download/instagram`
**البلوجن:** `ريلزات.js`
- **الطلب:** `GET /api/v1/download/instagram?url=<رابط>`

### `/api/v1/download_instagram` ⚠️
**البلوجن:** `انستا.js`
- **الطلب:** `GET /api/v1/download_instagram?url=<رابط>`
- **الاستجابة:** `{ "status": true, "media_type": "video|image", "download_url": "https://..." }`
- **⚠️ ملاحظة:** `انستا.js` يستخدم شرطة سفلية (`download_instagram`) بينما `ريلزات.js` يستخدم شرطة مائلة (`download/instagram`). هذان **مساران مختلفان** — وحّدهما في خدمتك أو غيّر المسار في `انستا.js` إذا خدمتك تدعم واحداً فقط.

### `/api/v1/download/telgram`
**البلوجن:** `تيليجرام.js`
- **الطلب:** `GET /api/v1/download/telgram?url=<رابط تيليجرام>`

### `/api/v1/download/mods/link` و `/api/v1/download/mods/file`
**البلوجن:** `ترايد.js`
- **الطلب:** `GET /api/v1/download/mods/link?url=<رابط الصفحة>`
- **الطلب:** `GET /api/v1/download/mods/file?url=<رابط الملف>`

---

## 🛠️ الأدوات

### `/api/v1/tools/rb`
**البلوجن:** `rembg.js` (إزالة الخلفية)
- **الطلب:** `GET /api/v1/tools/rb?imageUrl=<رابط>`
- **الاستجابة:** رابط صورة مباشر (يُحمَّل كـ binary).

### `/api/v1/tools/check_porn`
**البلوجن:** `مضاد-اباحية.js`
- **الطلب:** `GET /api/v1/tools/check_porn?imageUrl=<رابط>`
- **الاستجابة:** `{ "result": { "labelName": "porn|neutral", "confidence": "0-100" } }`

---

## 🎮 الألعاب (مارد / Akinator)

### `/api/v1/games/mard-start`
- **الطلب:** `POST /api/v1/games/mard-start`
- **الاستجابة:** `{ "session": "...", "signature": "...", "question": "..." }`

### `/api/v1/games/mard-answer`
- **الطلب:** `POST` (JSON): `{ session, signature, step, progression, cm: "false" }`
- **الاستجابة:** `{ "step": 1, "progression": 10, "question": "...", "akitude": "...", "akitude_url": "..." }`

### `/api/v1/games/mard-cancel`
- **الطلب:** `POST` (JSON): `{ session, signature, step, progression, answer, cm: "false", sid: "NaN", question_filter: "string" }`
- **الاستجابة:** `{ "name_proposition": "...", "photo": "https://..." }`

---

## 🔐 OTP (blackwave)

**البلوجنات:** `otp-sensor.js`, `ارسال.js`
- **المسار:** `GET /api/blackwave/otp?key=<OTP_API_KEY>`
- **مفتاح البيئة:** `OTP_API_KEY` (يُضبط قبل التشغيل: `OTP_API_KEY=xxxx npm start`)
- **الاستجابة:**
  ```json
  { "otps": [ { "number": "212600000000", "code": "123456", "time": 1700000000000 } ] }
  ```
  - `time` بالمللي ثانية؛ البلوجن يتجاهل أي OTP أقدم من دقيقتين.

---

## 🧩 بلوجنات أخرى تذكر API_BASE

| البلوجن | الوصف |
|---|---|
| `تغبر.js` | أداة تحويل داخلية: تستبدل العناوين القديمة بعنوان `API_BASE` الحالي داخل ملفات `plugins/`. ليست نداءً خارجياً. |
| `ارسال.js` | نفس `/api/blackwave/otp` (يُرسل OTP كرسالة). |

---

## ✅ قائمة التحقق عند توصيل خدمة جديدة

1. غيّر `DEFAULT_API_BASE` في `lib/config.js` (أو استخدم متغيّر `API_BASE`).
2. تأكد أن خدمتك ترجّع **نفس الحقول** في الجدول أعلاه (خصوصاً `status` و `response`/`url`/`result`).
3. شغّل `npm run audit:plugins` للتأكد من عدم وجود كسر في التحميل.
4. شغّل `npm test` (33 اختباراً) للتأكد من سلامة الأساسيات.

> ملاحظة: هذا الملف توثيقي فقط — لا يحتوي أي مفاتيح أو أسرار.
