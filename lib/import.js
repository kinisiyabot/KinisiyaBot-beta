import Helper from './helper.js'

// مسار المجلد الجذر للأوامر (مستخدَم من lib/plugins.js لإعادة التحميل الساخن).
const WORKER_DIR = Helper.__dirname(import.meta.url, false)

export default async function importFile(module) {
    module = Helper.__filename(module)
    const module_ = await import(`${module}?id=${Date.now()}`)
    const result = module_ && 'default' in module_ ? module_.default : module_
    return result
}

export { WORKER_DIR }
