export interface RedirectsPluginConfig {
  i18n?: {
    defaultLocale: string
    locales: string[]
    pathnames?: Record<string, Record<string, string>>
  }
  studioConfig: {
    projectId: string
    dataset: string
    apiVersion: string
    token: string
  }
}

// Re-export all component types
export * from './components/RedirectsTable/types'