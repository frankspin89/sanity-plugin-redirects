import { definePlugin } from 'sanity'
import { redirectType } from './schema/redirectType'
import { RedirectsTool } from './tools/RedirectsTool'
import type { RedirectsPluginConfig } from './types'
import { createRedirectActions } from './actions/redirects'

export const redirectsPlugin = definePlugin<RedirectsPluginConfig>((config) => {
  if (!config.studioConfig) {
    throw new Error('redirectsPlugin: studioConfig is required')
  }

  // Create actions with provided config
  const actions = createRedirectActions(config.studioConfig)

  return {
    name: 'redirects',
    schema: {
      types: [redirectType],
    },
    tools: [
      {
        name: 'redirects',
        title: 'Redirects',
        component: RedirectsTool,
      },
    ],
    // Pass config and actions to context
    config: {
      ...config,
      actions,
    },
  }
})

export type { RedirectsPluginConfig }