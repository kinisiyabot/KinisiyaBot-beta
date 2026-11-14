// lib/plugin-load.js
// تحميل بلوجن واحد بأمان:
//   - مهلة قصوى (timeout) حتى لا يُعلّق بلوجن واحد إقلاع البوت.
//   - لا يرمي أبداً: يُرجع { ok, module } أو { ok:false, error }.
//   - عند الفشل يُظهر *اسم* البلوجن في console.error (يلتقطه نظام التصحيح
//     الذاتي فيُبلّغ المالك)، ويكمل البوت بباقي البلوجنات.
import { pathToFileURL } from 'url'

export const DEFAULT_PLUGIN_TIMEOUT = 20_000

// يستخرج اسم ملف البلوجن من مسار أو رابط، لعرضه في السجلّ.
export function pluginLabel(url) {
  try {
    const p = String(url).includes('://') ? new URL(String(url)).pathname : String(url)
    return decodeURIComponent(p.split('/').filter(Boolean).pop() || p)
  } catch {
    return String(url)
  }
}

export async function loadPlugin(url, options = {}) {
  const {
    timeoutMs = DEFAULT_PLUGIN_TIMEOUT,
    name,
    log = console.error,
  } = options
  const label = name || pluginLabel(url)
  const href = String(url).includes('://') ? String(url) : pathToFileURL(String(url)).href

  let timer
  try {
    const module = await Promise.race([
      import(href),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`plugin load timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
        if (typeof timer.unref === 'function') timer.unref()
      }),
    ])
    return { ok: true, module, name: label }
  } catch (error) {
    log(`⚠️ فشل تحميل البلوجن '${label}' — تم تخطيه ولن يتوقف البوت: ${error?.message || error}`)
    return { ok: false, error, name: label }
  } finally {
    clearTimeout(timer)
  }
}
