// توحيد أشكال تصدير البلوجنات: البلوجن قد يصدّر handler واحداً (افتراضي أو
// باسم `handler`)، أو مصفوفة من handlers (مثل شخصيات متعددة). بدون هذا
// التوحيد تُخزَّن المصفوفة كما هي ويفشل موزّع الأوامر في تشغيلها.
export function resolvePluginExports(module, filename) {
  let exported = module.default
  if (exported === undefined) exported = module.handler
  if (exported === undefined) exported = module
  const items = Array.isArray(exported) ? exported : [exported]
  const out = {}
  items.forEach((item, i) => {
    out[i === 0 ? filename : `${filename}#${i}`] = item
  })
  return out
}

export function unloadPlugin(plugins, filename) {
  for (const key of Object.keys(plugins)) {
    if (key === filename || key.startsWith(`${filename}#`)) delete plugins[key]
  }
}
