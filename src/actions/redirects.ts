import { createClient } from '@sanity/client'
import type { Redirect } from '../components/RedirectsTable/types'

export const createRedirectActions = (config: {
  projectId: string
  dataset: string
  apiVersion: string
  token: string
}) => {
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: config.token,
  })

  return {
    deleteRedirect: async (redirectId: string) => {
      try {
        await client.delete(redirectId)
        return { success: true }
      } catch (error) {
        console.error('Error deleting redirect:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        }
      }
    },

    updateRedirectStatus: async (redirectId: string, isActive: boolean) => {
      try {
        await client
          .patch(redirectId)
          .set({ isActive })
          .commit()

        return { success: true }
      } catch (error) {
        console.error('Error updating redirect status:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        }
      }
    },

    updateRedirect: async (redirect: Partial<Redirect>) => {
      try {
        const updateData = {
          source: redirect.source,
          destinationType: redirect.destinationType,
          ...(redirect.destinationType === 'internal' ? {
            internalDestination: redirect.internalDestination,
            externalDestination: undefined
          } : {
            externalDestination: redirect.externalDestination,
            internalDestination: undefined
          }),
          type: redirect.type,
          isActive: redirect.isActive,
          preserveQueryString: redirect.preserveQueryString,
          language: redirect.language,
        }

        await client
          .patch(redirect._id!)
          .set(updateData)
          .commit()

        return { success: true }
      } catch (error) {
        console.error('Error updating redirect:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        }
      }
    }
  }
}