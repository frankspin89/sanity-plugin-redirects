import type { ValidationResult } from './types'

export const redirectValidation = {
  normalizeUrl: (url: string) => {
    if (url === '/') return url
    return url.replace(/\/+$/, '').replace(/\/+/g, '/')
  },

  isValidPath: (path: string) => {
    const invalidChars = /[<>:"|?*\s]/
    return !invalidChars.test(path)
  },

  validateSource: async (
    source: string | undefined,
    client: any,
    currentId: string | null
  ): Promise<ValidationResult> => {
    if (!source) {
      return {
        isValid: false,
        errors: ['Source URL is required'],
        warnings: []
      }
    }

    const query = currentId
      ? `*[_type == "redirect" && source == $source && _id != $currentId][0]`
      : `*[_type == "redirect" && source == $source][0]`

    const existingRedirect = await client.fetch(
      query,
      { source, currentId }
    )

    if (existingRedirect) {
      return {
        isValid: false,
        errors: ['A redirect with this source path already exists'],
        warnings: []
      }
    }

    if (!source.startsWith('/')) {
      return {
        isValid: false,
        errors: ['Path must start with /'],
        warnings: []
      }
    }

    if (!redirectValidation.isValidPath(source)) {
      return {
        isValid: false,
        errors: ['Path contains invalid characters'],
        warnings: []
      }
    }

    const normalizedPath = redirectValidation.normalizeUrl(source)
    if (normalizedPath !== source) {
      return {
        isValid: true,
        errors: [],
        warnings: [`Path should be normalized to: ${normalizedPath}`]
      }
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    }
  },

  validateExternalUrl: (url: string): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    if (!url) {
      errors.push('External URL is required')
      return { isValid: false, errors, warnings }
    }

    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        errors.push('URL must use http or https protocol')
      }

      if (!parsedUrl.hostname.includes('.')) {
        warnings.push('URL should include a valid domain')
      }
    } catch {
      errors.push('Invalid URL format')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}