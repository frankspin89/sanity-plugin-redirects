import type { Redirect } from './types'

export const getInternalDestinationUrl = (internalDest: Redirect['internalDestination']) => {
  if (!internalDest?.slug?.current) return '[No destination selected]'

  const lang = internalDest.language || 'en' // Default to English if no language
  const isDefaultLocale = lang === 'en'

  // Early return if the locale is not supported
  if (!['en', 'nl'].includes(lang)) {
    return '[Invalid language]'
  }

  const slugPath = internalDest.slug.current

  switch (internalDest._type) {
    case 'post':
      return isDefaultLocale
        ? `/blog/${slugPath}`
        : `/${lang}/blog/${slugPath}`

    case 'author':
      const contributorsPath = lang === 'nl' ? '/medewerkers' : '/contributors'
      return isDefaultLocale
        ? `${contributorsPath}/${slugPath}`
        : `/${lang}${contributorsPath}/${slugPath}`

    case 'category':
      const topicsPath = lang === 'nl' ? '/onderwerpen' : '/topics'
      return isDefaultLocale
        ? `${topicsPath}/${slugPath}`
        : `/${lang}${topicsPath}/${slugPath}`

    case 'page':
      return isDefaultLocale
        ? `/${slugPath}`
        : `/${lang}/${slugPath}`

    default:
      return '[Unknown content type]'
  }
}