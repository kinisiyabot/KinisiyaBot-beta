import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';
import fetch from 'node-fetch';

/** --- مساعدة: رفع الصور إلى Uguu --- */
async function uploadToUguu(buffer) {
  const { ext = 'jpg', mime = 'image/jpeg' } = (await fileTypeFromBuffer(buffer)) || {};
  const form = new FormData();
  form.append('files[]', buffer, { filename: `image.${ext}`, contentType: mime });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Uguu upload failed: ${res.status}`);
      const json = await res.json();
      if (!json.files?.[0]?.url) throw new Error('Invalid Uguu response.');
      return json.files[0].url;
    } catch (err) {
      if (attempt < 3) await new Promise(r => setTimeout(r, 3000));
      else throw err;
    }
  }
}

/** --- helper: تحقق من وجود رابط (HEAD) --- */
async function urlExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.ok && (res.headers.get('content-type') || '').startsWith('video');
  } catch {
    return false;
  }
}

/** --- المعلـّق (handler) --- */
let handler = async (m, { conn, args, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!args.length && !/image/.test(mime)) {
    return m.reply(
      `⚙️ *الاستخدام:* ${usedPrefix + command} <وصف> | [16:9 او 9:16]\n` +
      `🖼️ او قم بالرد على صورة مع الوصف.\n\n` +
      `💡 مثال:\n${usedPrefix + command} "سيارة طائرة مستقبلية" | 16:9\n\n` +
      `✨ تم التطوير بواسطة 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓`
    );
  }

  try {
    const [promptArg, ratioArg] = args.join(' ').split('|').map(s => s?.trim()) || [];
    const ratio = ['16:9', '9:16'].includes(ratioArg) ? ratioArg : '16:9';

    let type = 'text-to-video';
    let imageUrl;

    if (/image/.test(mime)) {
      const media = await q.download();
      if (media.length > 10 * 1024 * 1024) throw new Error('الصورة كبيرة جداً! الحد الأقصى 10 ميجا.');
      imageUrl = await uploadToUguu(media);
      type = 'image-to-video';
    }

    const prompt = (promptArg && promptArg.length) ? promptArg : (type === 'image-to-video' ? 'Make moving' : null);
    if (!prompt) throw new Error('الوصف مطلوب لتوليد الفيديو.');

    const payload = {
      videoPrompt: prompt,
      videoAspectRatio: ratio,
      videoDuration: 5,
      videoQuality: '360p',
      videoModel: 'v4.5',
      videoImageUrl: imageUrl || '',
      videoPublic: false
    };

    const createRes = await fetch('https://veo31ai.io/api/pixverse-token/gen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://veo31ai.io',
        'Referer': 'https://veo31ai.io/',
        'User-Agent': 'Mozilla/5.0 (compatible; Bot)'
      },
      body: JSON.stringify(payload)
    });

    const createText = await createRes.text();
    let create;
    try { create = JSON.parse(createText); } catch { create = null; }

    if (!create) throw new Error('استجابة غير صالحة من الخادم (gen).');

    const taskId = create.taskId || create.task_id || create.data?.taskId || create.data?.task_id || create.id || create.jobId;
    if (!taskId) throw new Error('فشل الحصول على معرف المهمة من الخادم.');

    const statusPayload = {
      taskId: Number(taskId),
      videoPublic: false,
      videoQuality: payload.videoQuality,
      videoAspectRatio: payload.videoAspectRatio,
      videoPrompt: payload.videoPrompt
    };

    let loadingMsg = await conn.sendMessage(m.chat, {
      text: `🎥 *بدأ توليد الفيديو عبر VEO 3.1 (veo31ai.io)...*\n🧠 الوصف: ${prompt}\n🖼️ النوع: ${type}\n📏 النسبة: ${ratio}\n\n✨ بواسطة 𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨 𝐵𝛩𝑇`
    }, { quoted: m });

    let done = false, videoUrl = null, count = 0;
    while (!done && count < 80) {
      count++;
      try {
        const pollRes = await fetch('https://veo31ai.io/api/pixverse-token/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://veo31ai.io',
            'Referer': 'https://veo31ai.io/',
            'User-Agent': 'Mozilla/5.0 (compatible; Bot)'
          },
          body: JSON.stringify(statusPayload)
        }).catch(() => null);

        const pollText = pollRes ? await pollRes.text() : '';
        let status = {};
        try { status = pollText ? JSON.parse(pollText) : {}; } catch { status = {}; }

        if (status?.videoUrl) { videoUrl = status.videoUrl; done = true; break; }
        if (status?.outputUrl) { videoUrl = status.outputUrl; done = true; break; }
        if (status?.data?.videoUrl) { videoUrl = status.data.videoUrl; done = true; break; }

        const triedCdnCandidates = [
          `https://cdn.veo31ai.io/explore/${taskId}.mp4`,
          `https://cdn.veo31ai.io/${taskId}.mp4`,
        ];

        for (const cand of triedCdnCandidates) {
          if (await urlExists(cand)) {
            videoUrl = cand;
            done = true;
            break;
          }
        }

        if (status?.status && (status.status === 'done' || status.status === 'completed')) {
          const anyUrl = Object.values(status).find(v => typeof v === 'string' && v.startsWith('http'));
          if (anyUrl) { videoUrl = anyUrl; done = true; break; }
        }

        if (status?.status === 'failed' || status?.error) {
          throw new Error('فشل توليد الفيديو (server reported failure).');
        }

      } catch (err) {
        console.error('poll error:', err?.message || err);
      }

      const elapsed = count * 5;
      try {
        await conn.relayMessage(m.chat, {
          protocolMessage: {
            key: loadingMsg.key,
            type: 14,
            editedMessage: {
              conversation: `⏳ *جاري توليد الفيديو...*\n🧠 ${prompt}\n📏 النسبة: ${ratio}\n⏰ مر ${elapsed} ثانية\n\n✨ بواسطة 𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨 𝐵𝛩𝑇`
            }
          }
        }, {});
      } catch (e) { /* تجاهل أخطاء تحرير الرسالة */ }

      await new Promise(r => setTimeout(r, 5000));
    }

    if (!done || !videoUrl) throw new Error('انتهت مهلة توليد الفيديو أو لم يتم توفير رابط الفيديو.');

    await conn.sendMessage(m.chat, { delete: loadingMsg.key }).catch(() => null);

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `✅ *الفيديو جاهز!*\n\n🧠 الوصف: ${prompt}\n📏 النسبة: ${ratio}\n🎞️ النوع: ${type}\n\n✨ تم التطوير بواسطة 𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨 𝐵𝛩𝑇\n🤖 البوت الأقوى في توليد الفيديوهات`
    }, { quoted: m });

  } catch (e) {
    console.error('💀 VEO-3.1 خطأ (veo31ai):', e);
    m.reply(`💀 *فشل توليد الفيديو بـ VEO 3.1 (veo31ai)*\n⚙️ ${e.message}\n\n✨ تم التطوير بواسطة 𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨 𝐵𝛩𝑇`);
  }
};

handler.help = ['veo3 <وصف> | [16:9/9:16]'];
handler.tags = ['ai'];
handler.command = ['صورةلفيديو', 'img2vid', 'veo3', 'فيو'];

export default handler;