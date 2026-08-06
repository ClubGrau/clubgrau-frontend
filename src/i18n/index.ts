import { createI18n } from 'vue-i18n'
import { loadMessages } from './loadMessages'

export const i18n = createI18n({
  legacy: false,
  locale: 'pt',
  fallbackLocale: 'en',
  messages: loadMessages() as Parameters<typeof createI18n>[0]['messages'],
})
