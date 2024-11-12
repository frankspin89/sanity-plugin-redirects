import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, Container, Stack, Box, Spinner, useToast } from '@sanity/ui'
import { createClient } from '@sanity/client'
import { usePlugin } from 'sanity'
import { DeleteDialog } from './components/DeleteDialog'
import { EditDialog } from './components/EditDialog'
import { FilterButtons } from './components/FilterButtons'
import { TableRow } from './components/TableRow'
import type { Redirect } from './types'
import { SortDirection, SortField, TableHeader } from './components/TableHeader'
import { SearchBar } from './components/SearchBar'
import { tableStyles } from './styles'
import { TypeFilter } from './components/TypeFilter'

export function RedirectsTable() {
  const plugin = usePlugin()
  const toast = useToast()
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'issues'>('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'createdAt',
    direction: 'desc'
  })

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    redirect: Redirect | null
  }>({
    isOpen: false,
    redirect: null
  })

  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean
    redirect: Redirect | null
  }>({
    isOpen: false,
    redirect: null
  })

  const [contentTypeFilter, setContentTypeFilter] = useState('all')

  // Extract unique content types from redirects
  const contentTypes = useMemo(() => {
    const types = redirects
      .filter(r => r.internalDestination?._type)
      .map(r => r.internalDestination!._type)

    return ['all', ...Array.from(new Set(types))]
  }, [redirects])

  const client = useMemo(() => createClient(plugin.config.studioConfig), [plugin.config.studioConfig])
  const { actions } = plugin.config

  const fetchRedirects = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedRedirects = await client.fetch<Redirect[]>(`
        *[_type == "redirect"] | order(source asc) {
          _id,
          source,
          destinationType,
          externalDestination,
          "internalDestination": internalDestination->{
            _type,
            _id,
            "slug": slug.current,
            "language": language
          },
          type,
          isActive,
          language,
          notes,
          lastTestedAt,
          _createdAt,
          _updatedAt
        }
      `)

      // Create a map of all destinations for chain detection
      const redirectMap = new Map(
        fetchedRedirects.map(r => [
          r.source,
          r.destinationType === 'external'
            ? r.externalDestination
            : r.internalDestination?.slug?.current
        ])
      )

      // Analyze each redirect for chains and broken destinations
      const analyzedRedirects = fetchedRedirects.map(redirect => {
        const chain: string[] = [redirect.source]
        let current = redirect.destinationType === 'external'
          ? redirect.externalDestination
          : redirect.internalDestination?.slug?.current

        while (redirectMap.has(current!) && chain.length < 10) {
          chain.push(current!)
          current = redirectMap.get(current!)
        }

        const brokenDestination = redirect.destinationType === 'internal' && !redirect.internalDestination

        return {
          ...redirect,
          redirectChain: chain.length > 1 ? chain : undefined,
          brokenDestination
        }
      })

      setRedirects(analyzedRedirects)
    } catch (error) {
      console.error('Error fetching redirects:', error)
      toast.push({
        status: 'error',
        title: 'Error fetching redirects'
      })
    }
    setLoading(false)
  }, [client, toast])

  useEffect(() => {
    fetchRedirects()
  }, [fetchRedirects])

  const handleStatusChange = async (redirectId: string, newStatus: boolean) => {
    setUpdatingStatus(redirectId)

    // Optimistic update
    setRedirects(prevRedirects =>
      prevRedirects.map(r =>
        r._id === redirectId ? { ...r, isActive: newStatus } : r
      )
    )

    try {
      const result = await actions.updateRedirectStatus(redirectId, newStatus)

      if (result.success) {
        toast.push({
          status: 'success',
          title: `Redirect ${newStatus ? 'activated' : 'deactivated'}`
        })
      } else {
        // Revert optimistic update on error
        setRedirects(prevRedirects =>
          prevRedirects.map(r =>
            r._id === redirectId ? { ...r, isActive: !newStatus } : r
          )
        )
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error updating redirect status:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

      toast.push({
        status: 'error',
        title: 'Error updating redirect',
        description: errorMessage
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const openDeleteDialog = (redirect: Redirect) => {
    setDeleteDialog({
      isOpen: true,
      redirect
    })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      redirect: null
    })
  }

  const handleDeleteRedirect = async () => {
    if (!deleteDialog.redirect) return

    const redirectId = deleteDialog.redirect._id
    setDeletingId(redirectId)

    // Optimistic update
    setRedirects(prevRedirects =>
      prevRedirects.filter(r => r._id !== redirectId)
    )

    closeDeleteDialog()

    try {
      const result = await actions.deleteRedirect(redirectId)

      if (result.success) {
        toast.push({
          status: 'success',
          title: 'Redirect deleted'
        })
      } else {
        // Revert optimistic update on error
        fetchRedirects()
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error deleting redirect:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

      toast.push({
        status: 'error',
        title: 'Error deleting redirect',
        description: errorMessage
      })
    } finally {
      setDeletingId(null)
    }
  }

  const openEditDialog = (redirect: Redirect) => {
    setEditDialog({
      isOpen: true,
      redirect
    })
  }

  const closeEditDialog = () => {
    setEditDialog({
      isOpen: false,
      redirect: null
    })
  }

  const handleSaveRedirect = async (updatedRedirect: Partial<Redirect>) => {
    if (!editDialog.redirect) return

    setSavingId(editDialog.redirect._id)

    try {
      const result = await actions.updateRedirect(updatedRedirect)

      if (result.success) {
        toast.push({
          status: 'success',
          title: 'Redirect updated'
        })
        fetchRedirects()
        closeEditDialog()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error updating redirect:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

      toast.push({
        status: 'error',
        title: 'Error updating redirect',
        description: errorMessage
      })
    } finally {
      setSavingId(null)
    }
  }

  const filteredRedirects = useMemo(() => {
    let results = redirects.filter(redirect => {
      // Apply main filter
      switch (filter) {
        case 'active':
          return redirect.isActive
        case 'inactive':
          return !redirect.isActive
        case 'issues':
          return redirect.redirectChain || redirect.brokenDestination
        default:
          return true
      }
    })

    // Apply content type filter
    if (contentTypeFilter !== 'all') {
      results = results.filter(redirect =>
        redirect.internalDestination?._type === contentTypeFilter
      )
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(redirect =>
        redirect.source.toLowerCase().includes(query) ||
        (redirect.destinationType === 'external'
          ? redirect.externalDestination?.toLowerCase().includes(query)
          : redirect.internalDestination?.slug?.current.toLowerCase().includes(query))
      )
    }

    // Apply sort
    results.sort((a, b) => {
      let valueA, valueB

      switch (sort.field) {
        case 'createdAt':
          valueA = new Date(a._createdAt)
          valueB = new Date(b._createdAt)
          return sort.direction === 'asc'
            ? valueA.getTime() - valueB.getTime()
            : valueB.getTime() - valueA.getTime()
        case 'source':
          valueA = a.source
          valueB = b.source
          break
        case 'destination':
          valueA = a.destinationType === 'external' ? a.externalDestination : a.internalDestination?.slug?.current
          valueB = b.destinationType === 'external' ? b.externalDestination : b.internalDestination?.slug?.current
          break
        default:
          valueA = a[sort.field]
          valueB = b[sort.field]
      }

      if (!valueA) return 1
      if (!valueB) return -1

      return sort.direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA)
    })

    return results
  }, [redirects, filter, contentTypeFilter, searchQuery, sort])

  return (
    <Container width={5} margin={4}>
      <Stack space={4}>
        <Card padding={4} radius={2} shadow={1}>
          <Stack space={4}>
            <Box style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}>
              <FilterButtons
                currentFilter={filter}
                onFilterChange={setFilter}
              />
              <Box style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <TypeFilter
                  value={contentTypeFilter}
                  onChange={setContentTypeFilter}
                  contentTypes={contentTypes}
                />
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </Box>
            </Box>

            {loading ? (
              <Box padding={4} style={{ textAlign: 'center' }}>
                <Spinner />
              </Box>
            ) : (
              <table style={tableStyles.table}>
                <thead>
                  <tr>
                    <th style={{ ...tableStyles.header, width: '40px' }}></th>
                    <TableHeader
                      field="createdAt"
                      label="Created"
                      currentSort={sort}
                      onSort={field => setSort(prev => ({
                        field,
                        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                      align="left"
                    />
                    <TableHeader
                      field="source"
                      label="Source"
                      currentSort={sort}
                      onSort={field => setSort(prev => ({
                        field,
                        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                    />
                    <TableHeader
                      field="destination"
                      label="Destination"
                      currentSort={sort}
                      onSort={field => setSort(prev => ({
                        field,
                        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                    />
                    <TableHeader
                      field="type"
                      label="Type"
                      currentSort={sort}
                      onSort={field => setSort(prev => ({
                        field,
                        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                      align="center"
                    />
                    <TableHeader
                      field="language"
                      label="Lang"
                      currentSort={sort}
                      onSort={field => setSort(prev => ({
                        field,
                        direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                      align="center"
                    />
                    <th style={{
                      ...tableStyles.header,
                      textAlign: 'center',
                    }}>Issues</th>
                    <th style={{
                      ...tableStyles.header,
                      textAlign: 'right',
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRedirects.map((redirect) => (
                    <TableRow
                      key={redirect._id}
                      redirect={redirect}
                      onStatusChange={handleStatusChange}
                      onDeleteClick={openDeleteDialog}
                      onEditClick={openEditDialog}
                      isUpdating={updatingStatus === redirect._id}
                      isDeleting={deletingId === redirect._id}
                      isSaving={savingId === redirect._id}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </Stack>
        </Card>
      </Stack>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        redirect={deleteDialog.redirect}
        onClose={closeDeleteDialog}
        onDelete={handleDeleteRedirect}
        isDeleting={Boolean(deletingId)}
      />

      <EditDialog
        isOpen={editDialog.isOpen}
        redirect={editDialog.redirect}
        onClose={closeEditDialog}
        onSave={handleSaveRedirect}
        isSaving={Boolean(savingId)}
        config={plugin.config.studioConfig}
      />
    </Container>
  )
}