import { getRequestConfig } from 'next-intl/server'

// Only English is supported. Locale is always 'en'.
export default getRequestConfig(async () => {
  return {
    locale: 'en',
    messages: (await import('../messages/en.json')).default,
  }
})
