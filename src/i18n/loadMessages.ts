function getDefaultExport(module: unknown): Record<string, unknown> {
  if (module && typeof module === 'object' && 'default' in module) {
    return (module as { default: Record<string, unknown> }).default
  }

  return module as Record<string, unknown>
}

/** Loads shared and co-located locale JSON files into vue-i18n messages. */
export function loadMessages() {
  const messages: Record<string, Record<string, unknown>> = {}

  const sharedModules = import.meta.glob('./locales/*.json', { eager: true })

  for (const [path, module] of Object.entries(sharedModules)) {
    const locale = path.match(/\/([^/]+)\.json$/)?.[1]
    if (!locale) continue

    messages[locale] = {
      ...messages[locale],
      ...getDefaultExport(module),
    }
  }

  const scopedModules = import.meta.glob(
    ['../views/**/locales/*.json', '../components/**/locales/*.json'],
    { eager: true },
  )

  for (const [path, module] of Object.entries(scopedModules)) {
    const match = path.match(/\/([^/]+)\/locales\/([^/]+)\.json$/)
    if (!match) continue

    const [, scope, locale] = match

    messages[locale] ??= {}
    messages[locale][scope] = getDefaultExport(module)
  }

  return messages
}
