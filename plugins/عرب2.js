// arabseed-range-fixed-handler.js
// ES module — Requires: axios cheerio fs-extra
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";

const sessions = new Map();
const UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36";

/* ---------- helpers ---------- */
function resolveUrl(base, href) {
  try {
    if (!href) return null;
    href = href.trim();
    if (href.startsWith("http://") || href.startsWith("https://")) return href;
    return new URL(href, base).href;
  } catch (e) { return href; }
}
function cleanText(t) {
  try { return decodeURIComponent(String(t || "")).replace(/\s+/g, " ").trim(); }
  catch { return String(t || "").replace(/\s+/g, " ").trim(); }
}
async function fetchPage(url) {
  const res = await axios.get(url, {
    headers: { 'User-Agent': UA, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
    maxRedirects: 10,
    timeout: 30000
  });
  return cheerio.load(res.data);
}

// (إخراج الحلقات و روابط التحميل) — كما قبل
function extractEpisodes($, baseUrl) {
  const episodes = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    const rawText = $(el).text() || $(el).attr('title') || '';
    const text = cleanText(rawText);
    if (!href) return;
    const url = resolveUrl(baseUrl, href);
    if (!url) return;
    const lower = url.toLowerCase();
    if (lower.includes('facebook') || lower.includes('twitter') || lower.includes('/watch') || lower.includes('share') || lower.includes('#')) return;
    if (!lower.includes('asd.homes') && !lower.includes('arabseed')) return;
    const decoded = (cleanText(url) + ' ' + text).toLowerCase();
    if (!(decoded.includes('عرض') || decoded.includes('حلقة') || /wwe|episode|ep-|ep\./.test(decoded) || /\d{1,2}\.\d{1,2}\.\d{2,4}/.test(decoded))) return;
    if (text.length < 6) return;
    episodes.push({ title: text, url });
  });
  const map = new Map();
  for (const e of episodes) if (!map.has(e.url)) map.set(e.url, e);
  return [...map.values()];
}
function extractDownloadLinks($, baseUrl) {
  const links = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    const text = cleanText($(el).text() || $(el).attr('title') || '');
    if (!href) return;
    const url = resolveUrl(baseUrl, href);
    if (!url) return;
    const l = url.toLowerCase();
    if (l.endsWith('.mp4') || l.endsWith('.mkv') || l.includes('/download') || /تحميل|جودة|720|1080|480|HD|WEB-DL/gi.test(text)) {
      links.push({ url, text: text || url });
    }
  });
  $('script').each((_, el) => {
    const script = $(el).html() || '';
    const jsUrlRegex = /(?:file|source|src)\s*[:=]\s*["'](https?:\/\/[^"']+\.(?:mp4|mkv)[^"']*)["']/g;
    let m;
    while ((m = jsUrlRegex.exec(script)) !== null) links.push({ url: m[1], text: 'from-script' });
    const jsonUrlRegex = /"(?:file|src)"\s*:\s*"(https?:\/\/[^"]+\.(?:mp4|mkv)[^"]*)"/g;
    while ((m = jsonUrlRegex.exec(script)) !== null) links.push({ url: m[1], text: 'from-json' });
  });
  const uniq = [];
  const seen = new Set();
  for (const l of links) if (!seen.has(l.url)) { seen.add(l.url); uniq.push(l); }
  return uniq;
}

/* ---------- RANGE downloader (core fix) ---------- */

/**
 * Performs HEAD to learn content-length and accept-ranges.
 * If server supports byte ranges, downloads in sequential chunks with Range headers,
 * ensuring Accept-Encoding: identity and Referer are sent (as in the curl examples). 
 * This matches the method observed in the uploaded sample. 4
 *
 * @param {string} videoUrl - direct CDN/file URL
 * @param {string|null} referer - referer header (usually the /category/downloadz/?r=... page)
 * @param {string|null} cookie - optional Cookie header if needed (_lnk_ etc.)
 * @returns {Promise<{path,fileName,mimetype}>}
 */
async function downloadVideoByRanges(videoUrl, referer = null, cookie = null) {
  const tmpdir = os.tmpdir();
  const guessedName = path.basename(new URL(videoUrl).pathname) || `arabseed_${Date.now()}.mp4`;
  const ext = path.extname(guessedName) || '.mp4';
  const fname = `arabseed_${Date.now()}${ext}`;
  const fpath = path.join(tmpdir, fname);

  // HEAD to inspect support
  let head;
  try {
    head = await axios.request({
      method: 'HEAD',
      url: videoUrl,
      headers: { 'User-Agent': UA, ...(referer ? { Referer: referer } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      maxRedirects: 10,
      timeout: 15000,
      validateStatus: null
    });
  } catch (e) {
    head = null;
  }

  // Try to determine length & accept-ranges
  let total = 0;
  let acceptRanges = false;
  let mime = 'video/mp4';
  if (head && head.status && head.status < 400) {
    const cl = head.headers['content-length'] || null;
    const cr = head.headers['content-range'] || null;
    if (cl) total = parseInt(cl, 10);
    else if (cr) {
      const match = cr.match(/\/(\d+)$/);
      if (match) total = parseInt(match[1], 10);
    }
    acceptRanges = (head.headers['accept-ranges'] || '').toLowerCase().includes('bytes');
    if (head.headers['content-type']) mime = head.headers['content-type'];
  }

  // If server supports ranges (typical for CDN), download in chunks.
  if (acceptRanges && total > 0) {
    const chunkSize = 50 * 1024 * 1024; // 50 MB
    let start = 0;
    // Ensure file empty
    await fs.ensureFile(fpath);
    await fs.truncate(fpath, 0);
    while (start < total) {
      const end = Math.min(start + chunkSize - 1, total - 1);
      const headers = {
        'User-Agent': UA,
        'Accept-Encoding': 'identity',
        'Connection': 'close',
        'Range': `bytes=${start}-${end}`,
        ...(referer ? { Referer: referer } : {}),
        ...(cookie ? { Cookie: cookie } : {})
      };
      // Request chunk as stream
      const resp = await axios.get(videoUrl, {
        headers,
        responseType: 'stream',
        maxRedirects: 10,
        timeout: 0,
        validateStatus: status => (status >= 200 && status < 400) || status === 206
      });
      // Append chunk to file
      const ws = fs.createWriteStream(fpath, { flags: 'a' });
      await pipeline(resp.data, ws);
      // advance
      start = end + 1;
    }
    // verify size
    const stats = await fs.stat(fpath);
    if (total > 0 && stats.size !== total) {
      // if size mismatch, still return file — caller may decide
      console.warn(`Downloaded size mismatch: expected ${total}, got ${stats.size}`);
    }
    return { path: fpath, fileName: fname, mimetype: mime };
  }

  // Fallback: single GET stream (no range support)
  // Use Accept-Encoding: identity and Referer to mimic browser and avoid HTML guards.
  const resp = await axios.get(videoUrl, {
    headers: { 'User-Agent': UA, 'Accept-Encoding': 'identity', ...(referer ? { Referer: referer } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    responseType: 'stream',
    maxRedirects: 10,
    timeout: 0,
    validateStatus: status => (status >= 200 && status < 400)
  });
  mime = resp.headers['content-type'] || mime;
  await pipeline(resp.data, fs.createWriteStream(fpath));
  return { path: fpath, fileName: fname, mimetype: mime };
}

/**
 * High-level sender: if the link is to a download page (not direct mp4), the caller should
 * pass referer = the download page url (/category/downloadz/?r=...) so the CDN accepts requests
 * (as seen in the sniffed curls in the uploaded file). 5
 */
async function sendVideoUsingRanges(conn, m, candidateUrl, referer = null, cookie = null, caption = "") {
  // Try HEAD to see if direct video is available
  let head;
  try {
    head = await axios.head(candidateUrl, {
      headers: { 'User-Agent': UA, 'Accept-Encoding': 'identity', ...(referer ? { Referer: referer } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      maxRedirects: 10,
      validateStatus: null,
      timeout: 10000
    });
  } catch (e) {
    head = null;
  }

  const contentType = head && head.headers && head.headers['content-type'] ? head.headers['content-type'] : null;
  // If server says it's a video, try sending by URL (fast)
  if (contentType && contentType.startsWith('video')) {
    try {
      const fname = path.basename(new URL(candidateUrl).pathname) || `arabseed_${Date.now()}.mp4`;
      await conn.sendMessage(m.chat, { video: { url: candidateUrl }, fileName: fname, caption: caption || '' }, { quoted: m });
      return { ok: true, method: 'url' };
    } catch (e) {
      // continue to ranged download
      console.warn("send by url failed, falling back to ranged download", e.message || e);
    }
  }

  // Download (with ranges when possible) and send as file
  try {
    const dl = await downloadVideoByRanges(candidateUrl, referer, cookie);
    await conn.sendMessage(m.chat, {
      video: fs.createReadStream(dl.path),
      fileName: dl.fileName,
      mimetype: dl.mimetype,
      caption: caption || ''
    }, { quoted: m });
    try { await fs.remove(dl.path); } catch (e) {}
    return { ok: true, method: 'file' };
  } catch (err) {
    console.error("download/send error:", err);
    return { ok: false, error: err };
  }
}

/* ---------- main handler (commands + replies like before) ---------- */
let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const chatId = m.chat;
    const text = (m.text || "").trim();
    const cmd = (command || "").toLowerCase();

    // Start command: arabdl / arabdown
    if (cmd === 'arabdl' || cmd === 'arabdown') {
      let url = args && args.length ? args.join(" ").trim() : m.quoted?.text || null;
      if (!url) return m.reply(`❌ أدخل رابط ArabSeed\nمثال: ${usedPrefix + command} https://a.asd.homes/...`);
      await m.reply("⏳ جاري جلب الصفحة وتحليل الحلقات...");
      const $ = await fetchPage(url);
      const title = cleanText($('h1, .title, .post-title').first().text()) || cleanText($('title').text()) || 'عرض';
      const episodes = extractEpisodes($, url);
      if (episodes && episodes.length > 0) {
        const list = episodes.slice(0, 50);
        let out = `✅ *${title}*\n\n📺 الحلقات المتاحة: ${episodes.length}\n\n`;
        list.forEach((ep, i) => out += `${i + 1}. ${ep.title}\n   ${ep.url}\n`);
        out += `\nأرسل رقم الحلقة (مثال: 1) أو اكتب "${usedPrefix}اختيار-حلقة 1".`;
        sessions.set(chatId, { stage: 'awaiting_episode', title, originalUrl: url, episodes, createdAt: Date.now() });
        return conn.reply(m.chat, out, m);
      }
      const downloadLinks = extractDownloadLinks($, url);
      if (!downloadLinks || !downloadLinks.length) return m.reply("❌ لم أجد حلقات أو روابط تحميل.", m);
      let out = `✅ *${title}*\n\n📥 روابط التحميل المتاحة:\n\n`;
      downloadLinks.forEach((l, i) => out += `${i + 1}. ${l.text || 'جودة'}\n   ${l.url}\n`);
      out += `\nأرسل رقم الخيار أو اكتب "${usedPrefix}اختيار-جودة 1".`;
      sessions.set(chatId, { stage: 'awaiting_quality', title, originalUrl: url, downloadLinks, createdAt: Date.now() });
      return conn.reply(m.chat, out, m);
    }

    // اختيار-حلقة command
    if (cmd === 'اختيار-حلقة') {
      const numArg = args && args.length ? args[0] : null;
      if (!sessions.has(chatId)) return conn.reply(m.chat, "❌ لا توجد جلسة. ابدأ بـ " + usedPrefix + "arabdl <url>", m);
      if (!numArg) return conn.reply(m.chat, `❌ أدخل رقم الحلقة.\nمثال: ${usedPrefix}اختيار-حلقة 1`, m);
      const num = parseInt(numArg, 10);
      const session = sessions.get(chatId);
      if (session.stage !== 'awaiting_episode') return conn.reply(m.chat, "❌ ليست في مرحلة اختيار الحلقة.", m);
      if (!num || num < 1 || num > session.episodes.length) return conn.reply(m.chat, `❌ رقم غير صحيح (1 - ${session.episodes.length})`, m);
      const ep = session.episodes[num - 1];
      await conn.reply(m.chat, `⏳ جلب صفحة الحلقة: ${ep.title}\n${ep.url}`, m);
      const $ = await fetchPage(ep.url);
      const downloadLinks = extractDownloadLinks($, ep.url);
      if (!downloadLinks || !downloadLinks.length) { sessions.delete(chatId); return conn.reply(m.chat, "❌ لم أجد روابط تحميل.", m); }
      session.stage = 'awaiting_quality';
      session.currentEpisode = ep;
      session.downloadLinks = downloadLinks;
      // Best-effort: detect a referer for direct CDN links — often the page with /category/downloadz/?r=... is needed
      // We store ep.url as referer; caller may override by passing cookies or special header later.
      session.referer = ep.url;
      sessions.set(chatId, session);
      let out = `📥 روابط التحميل للحلقة: *${ep.title}*\n\n`;
      downloadLinks.forEach((l, i) => out += `${i + 1}. ${l.text || 'جودة'}\n   ${l.url}\n`);
      out += `\nأرسل رقم الجودة أو اكتب "${usedPrefix}اختيار-جودة 1".`;
      return conn.reply(m.chat, out, m);
    }

    // اختيار-جودة command
    if (cmd === 'اختيار-جودة') {
      const numArg = args && args.length ? args[0] : null;
      if (!sessions.has(chatId)) return conn.reply(m.chat, "❌ لا توجد جلسة.", m);
      if (!numArg) return conn.reply(m.chat, `❌ أدخل رقم الجودة.\nمثال: ${usedPrefix}اختيار-جودة 1`, m);
      const num = parseInt(numArg, 10);
      const session = sessions.get(chatId);
      if (session.stage !== 'awaiting_quality') return conn.reply(m.chat, "❌ ليست في مرحلة اختيار الجودة.", m);
      if (!num || num < 1 || num > session.downloadLinks.length) return conn.reply(m.chat, `❌ رقم غير صحيح (1 - ${session.downloadLinks.length})`, m);

      const link = session.downloadLinks[num - 1];
      await conn.reply(m.chat, `⏳ جاري تجهيز وإرسال الفيديو...\n${link.url}`, m);

      // IMPORTANT: sometimes ArabSeed provides intermediate "download" pages with ?r=... that set cookies/_lnk_
      // If the link looks like a CDN direct link (cdnfdc*.cdn.boutique etc.) we must set Referer to the download page (observed in sample). 6
      const referer = session.referer || session.originalUrl || null;
      // optional cookie (if you can extract it from page navigation). Here we try to read a cookie pattern _lnk_ if available in session (you can set session.cookie earlier).
      const cookie = session.cookie || null;

      const sent = await sendVideoUsingRanges(conn, m, link.url, referer, cookie, session.currentEpisode?.title || session.title || '');
      sessions.delete(chatId);
      if (sent.ok) return conn.reply(m.chat, `✅ تم إرسال الفيديو (${sent.method}).`, m);
      console.error("send failed:", sent.error);
      return conn.reply(m.chat, `❌ فشل إرسال الفيديو: ${sent.error?.message || sent.error}`, m);
    }

    // قبول رقم فقط أو "اختر 1"
    const chooseMatch = text.match(/^(?:اختر|choose|pick)?\s*([0-9]{1,3})\s*$/i);
    if (chooseMatch && sessions.has(chatId)) {
      const session = sessions.get(chatId);
      const num = parseInt(chooseMatch[1], 10);
      // cancel
      if (/^(cancel|إلغاء|خروج)$/i.test(text)) { sessions.delete(chatId); return conn.reply(m.chat, "✅ تم إلغاء العملية.", m); }
      if (session.stage === 'awaiting_episode') {
        if (!num || num < 1 || num > session.episodes.length) return conn.reply(m.chat, `❌ رقم غير صحيح (1 - ${session.episodes.length})`, m);
        const ep = session.episodes[num - 1];
        await conn.reply(m.chat, `⏳ جلب صفحة الحلقة: ${ep.title}\n${ep.url}`, m);
        const $ = await fetchPage(ep.url);
        const downloadLinks = extractDownloadLinks($, ep.url);
        if (!downloadLinks || !downloadLinks.length) { sessions.delete(chatId); return conn.reply(m.chat, "❌ لم أجد روابط تحميل.", m); }
        session.stage = 'awaiting_quality';
        session.currentEpisode = ep;
        session.downloadLinks = downloadLinks;
        session.referer = ep.url;
        sessions.set(chatId, session);
        let out = `📥 روابط التحميل للحلقة: *${ep.title}*\n\n`;
        downloadLinks.forEach((l, i) => out += `${i + 1}. ${l.text || 'جودة'}\n   ${l.url}\n`);
        out += `\nأرسل رقم الجودة أو اكتب "${usedPrefix}اختيار-جودة 1".`;
        return conn.reply(m.chat, out, m);
      }
      if (session.stage === 'awaiting_quality') {
        if (!num || num < 1 || num > session.downloadLinks.length) return conn.reply(m.chat, `❌ رقم غير صحيح (1 - ${session.downloadLinks.length})`, m);
        const link = session.downloadLinks[num - 1];
        await conn.reply(m.chat, `⏳ جاري تجهيز وإرسال الفيديو...\n${link.url}`, m);
        const sent = await sendVideoUsingRanges(conn, m, link.url, session.currentEpisode?.url || session.originalUrl, session.cookie || null, session.currentEpisode?.title || session.title || '');
        sessions.delete(chatId);
        if (sent.ok) return conn.reply(m.chat, `✅ تم إرسال الفيديو (${sent.method}).`, m);
        console.error("send failed:", sent.error);
        return conn.reply(m.chat, `❌ فشل إرسال الفيديو: ${sent.error?.message || sent.error}`, m);
      }
    }

    // cancel global
    if (/^(cancel|إلغاء|خروج)$/i.test(text) && sessions.has(chatId)) {
      sessions.delete(chatId);
      return conn.reply(m.chat, "✅ تم إلغاء العملية.", m);
    }

    return;
  } catch (err) {
    console.error("Handler error:", err);
    try { return m.reply(`❌ حدث خطأ: ${err.message}`); } catch (e) {}
  }
};

handler.help = ["arabdl", "اختيار-حلقة", "اختيار-جودة"];
handler.command = ["arabdl","arabdown","اختيار-حلقة","اختيار-جودة"];
handler.tags = ["downloader"];
handler.limit = true;
handler.all = true;

export default handler;