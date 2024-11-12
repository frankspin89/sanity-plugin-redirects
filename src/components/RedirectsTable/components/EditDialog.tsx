import { Box, Dialog, Stack, Text, Button, TextInput, Select, Card, Switch } from '@sanity/ui'
import { SearchIcon, ImageIcon } from '@sanity/icons'
import { defineField, type Reference } from '@sanity/types'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { languageEmoji } from '../constants'
import { createClient } from '@sanity/client'
import { Redirect } from '../types'
import { redirectValidation } from '../validation'
import { ValidationInput } from './ValidationInput'
import type { ValidationResult } from '../types'

interface EditDialogProps {
  isOpen: boolean
  redirect: Redirect | null
  onClose: () => void
  onSave: (updatedRedirect: Partial<Redirect>) => Promise<void>
  isSaving: boolean
  config: {
    projectId: string
    dataset: string
    apiVersion: string
    token: string
  }
}

// Add interface for internal options
interface InternalOption {
  _id: string
  _type: string
  title: string
  slug?: { current: string }
  language?: string
  image?: string
}

export function EditDialog({ isOpen, redirect, onClose, onSave, isSaving, config }: EditDialogProps) {
  const [source, setSource] = useState('')
  const [destinationType, setDestinationType] = useState<'internal' | 'external'>('external')
  const [internalDestination, setInternalDestination] = useState<Reference | null>(null)
  const [externalDestination, setExternalDestination] = useState('')
  const [type, setType] = useState<'permanent' | 'temporary'>('permanent')
  const [isActive, setIsActive] = useState(true)
  const [preserveQueryString, setPreserveQueryString] = useState(true)
  const [language, setLanguage] = useState<'all' | 'nl' | 'en'>('all')
  const [internalOptions, setInternalOptions] = useState<InternalOption[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [validationState, setValidationState] = useState<{
    source: ValidationResult
    externalUrl: ValidationResult
  }>({
    source: { isValid: true, errors: [], warnings: [] },
    externalUrl: { isValid: true, errors: [], warnings: [] }
  })

  const client = useMemo(() => createClient(config), [config])

  useEffect(() => {
    async function fetchInternalOptions() {
      try {
        const result = await client.fetch<InternalOption[]>(`
          *[_type in ["post", "author", "category"]] {
            _id,
            _type,
            title,
            slug,
            language,
            "image": mainImage.asset->url
          }
        `)
        setInternalOptions(result)
      } catch (error) {
        console.error('Error fetching internal options:', error)
      }
    }

    if (isOpen) {
      fetchInternalOptions()
    }
  }, [isOpen, client])

  useEffect(() => {
    if (redirect) {
      setSource(redirect.source || '')
      setDestinationType(redirect.destinationType || 'external')
      setInternalDestination(
        redirect.internalDestination
          ? {
            _type: 'reference',
            _ref: redirect.internalDestination._id,
            _weak: true
          }
          : null
      )
      setExternalDestination(redirect.externalDestination || '')
      setType(redirect.type || 'permanent')
      setIsActive(redirect.isActive ?? true)
      setPreserveQueryString(redirect.preserveQueryString ?? true)
      setLanguage(redirect.language || 'all')
    }
  }, [redirect])

  // Validate form function
  const validateForm = useCallback(async () => {
    const sourceValidation = await redirectValidation.validateSource(
      source,
      client,
      redirect?._id || null
    )

    let externalUrlValidation = { isValid: true, errors: [], warnings: [] }
    if (destinationType === 'external') {
      externalUrlValidation = redirectValidation.validateExternalUrl(externalDestination)
    }

    setValidationState({
      source: sourceValidation,
      externalUrl: externalUrlValidation
    })

    return sourceValidation.isValid &&
      (destinationType === 'internal' || externalUrlValidation.isValid)
  }, [source, destinationType, externalDestination, redirect?._id, client])

  // Run validation on field changes
  useEffect(() => {
    validateForm()
  }, [source, destinationType, externalDestination, validateForm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) return

    const updatePayload = {
      _id: redirect?._id,
      source,
      destinationType,
      internalDestination: destinationType === 'internal' ? {
        _type: 'reference',
        _ref: internalDestination?._ref,
        _weak: true
      } : undefined,
      externalDestination: destinationType === 'external' ? externalDestination : undefined,
      type,
      isActive,
      preserveQueryString,
      language
    }

    try {
      await onSave(updatePayload)
    } catch (error) {
      console.error('Error saving redirect:', error)
    }
  }

  // Filter options based on language and search query
  const filteredOptions = useMemo(() => {
    return internalOptions.filter(option => {
      const matchesLanguage = language === 'all' || option.language === language
      const matchesSearch = !searchQuery ||
        option.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option._type?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesLanguage && matchesSearch
    })
  }, [internalOptions, language, searchQuery])

  // Internal destination field component
  const InternalDestinationField = () => {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    const selectedItem = useMemo(() => {
      return internalOptions.find(item => item._id === internalDestination?._ref)
    }, [internalOptions, internalDestination])

    const handleSelect = (item: InternalOption) => {
      setInternalDestination({
        _type: 'reference',
        _ref: item._id,
        _weak: true
      })
      setSearchQuery('')
      setIsOpen(false)
    }

    return (
      <Stack space={2}>
        <Text size={1} weight="semibold">Internal Destination</Text>
        <Box ref={ref} style={{ position: 'relative' }}>
          {selectedItem ? (
            <Card
              padding={3}
              radius={2}
              tone="transparent"
              border
              style={{
                background: '#101112',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => setIsOpen(true)}
            >
              <Box style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    style={{
                      width: '32px',
                      height: '32px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <Box
                    style={{
                      width: '32px',
                      height: '32px',
                      background: '#2a2a2a',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ImageIcon style={{ color: '#666' }} />
                  </Box>
                )}
                <Stack space={1}>
                  <Text weight="semibold">{selectedItem.title}</Text>
                  <Text size={1} muted>
                    {selectedItem._type} {selectedItem.language && `• ${languageEmoji[selectedItem.language]}`}
                  </Text>
                </Stack>
              </Box>
            </Card>
          ) : (
            <TextInput
              icon={SearchIcon}
              value={searchQuery}
              onChange={event => {
                setSearchQuery(event.currentTarget.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search for a page..."
            />
          )}

          {isOpen && (
            <Card
              padding={1}
              radius={2}
              tone="transparent"
              border
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '2px',
                background: '#101112',
                zIndex: 1000,
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              <Stack space={1}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map(item => (
                    <Card
                      key={item._id}
                      padding={3}
                      radius={2}
                      tone={internalDestination?._ref === item._id ? 'primary' : 'transparent'}
                      onClick={() => handleSelect(item)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: internalDestination?._ref === item._id ? undefined : 'transparent',
                        '&:hover': {
                          backgroundColor: internalDestination?._ref === item._id ? undefined : '#1a1a1a'
                        }
                      }}
                    >
                      <Box style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{
                              width: '40px',
                              height: '40px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                        ) : (
                          <Box
                            style={{
                              width: '40px',
                              height: '40px',
                              background: '#2a2a2a',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <ImageIcon style={{ color: '#666' }} />
                          </Box>
                        )}
                        <Stack space={1}>
                          <Text weight="semibold">{item.title}</Text>
                          <Text size={1} muted>
                            {item._type} {item.language && `• ${languageEmoji[item.language]}`}
                          </Text>
                        </Stack>
                      </Box>
                    </Card>
                  ))
                ) : (
                  <Box padding={4}>
                    <Text align="center" muted>No results found</Text>
                  </Box>
                )}
              </Stack>
            </Card>
          )}
        </Box>
      </Stack>
    )
  }

  if (!isOpen) return null

  return (
    <Dialog
      header={
        <Box padding={4}>
          <Text weight="semibold" size={2}>
            {redirect ? 'Edit' : 'Create'} Redirect
          </Text>
        </Box>
      }
      id="edit-redirect-dialog"
      onClose={onClose}
      open={isOpen}
      width={2}
      scheme="dark"
    >
      <Box padding={4} as="form" onSubmit={handleSubmit}>
        <Stack space={6}>
          {/* Source URL */}
          <Stack space={2}>
            <Text size={1} weight="semibold">Source URL</Text>
            <ValidationInput
              value={source}
              onChange={(event) => setSource(event.currentTarget.value)}
              placeholder="/old-url"
              disabled={isSaving}
              validation={[
                ...(validationState.source.errors || []).map(error => ({
                  level: 'error',
                  message: error
                })),
                ...(validationState.source.warnings || []).map(warning => ({
                  level: 'warning',
                  message: warning
                }))
              ]}
            />
          </Stack>

          {/* Destination Type */}
          <Stack space={2}>
            <Text size={1} weight="semibold">Destination Type</Text>
            <Card padding={2} radius={2} tone="transparent" border>
              <Stack space={2}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px' }}>
                  <input
                    type="radio"
                    checked={destinationType === 'internal'}
                    onChange={() => setDestinationType('internal')}
                    disabled={isSaving}
                  />
                  <Text>Internal Page</Text>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px' }}>
                  <input
                    type="radio"
                    checked={destinationType === 'external'}
                    onChange={() => setDestinationType('external')}
                    disabled={isSaving}
                  />
                  <Text>External URL</Text>
                </label>
              </Stack>
            </Card>
          </Stack>

          {/* Internal/External Destination */}
          {destinationType === 'internal' ? (
            <InternalDestinationField />
          ) : (
            <Stack space={2}>
              <Text size={1} weight="semibold">External URL</Text>
              <ValidationInput
                value={externalDestination}
                onChange={(event) => setExternalDestination(event.currentTarget.value)}
                placeholder="https://example.com/new-url"
                disabled={isSaving}
                validation={[
                  ...(validationState.externalUrl.errors || []).map(error => ({
                    level: 'error',
                    message: error
                  })),
                  ...(validationState.externalUrl.warnings || []).map(warning => ({
                    level: 'warning',
                    message: warning
                  }))
                ]}
              />
            </Stack>
          )}

          {/* Redirect Type */}
          <Stack space={2}>
            <Text size={1} weight="semibold">Redirect Type</Text>
            <Select
              value={type}
              onChange={event => setType(event.currentTarget.value as 'permanent' | 'temporary')}
              disabled={isSaving}
              style={{ width: '100%', background: '#101112', border: '1px solid #2a2a2a' }}
            >
              <option value="permanent">Permanent (301)</option>
              <option value="temporary">Temporary (302)</option>
            </Select>
          </Stack>

          {/* Status */}
          <Card padding={4} radius={2} tone="transparent" border>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Stack space={2}>
                <Text size={1} weight="semibold">Active</Text>
                <Text size={1} muted>Enable or disable this redirect</Text>
              </Stack>
              <Box style={{ marginLeft: 'auto' }}>
                <Switch
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                  disabled={isSaving}
                />
              </Box>
            </Box>
          </Card>

          {/* Query String */}
          <Card padding={4} radius={2} tone="transparent" border>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Stack space={2}>
                <Text size={1} weight="semibold">Preserve Query String</Text>
                <Text size={1} muted>Keep the query parameters when redirecting</Text>
              </Stack>
              <Box style={{ marginLeft: 'auto' }}>
                <Switch
                  checked={preserveQueryString}
                  onChange={() => setPreserveQueryString(!preserveQueryString)}
                  disabled={isSaving}
                />
              </Box>
            </Box>
          </Card>

          {/* Language */}
          <Stack space={2}>
            <Text size={1} weight="semibold">Language</Text>
            <Select
              value={language}
              onChange={event => setLanguage(event.currentTarget.value as 'all' | 'nl' | 'en')}
              disabled={isSaving}
              style={{ width: '100%', background: '#101112', border: '1px solid #2a2a2a' }}
            >
              <option value="all">All Languages {languageEmoji.all}</option>
              <option value="nl">Dutch Only {languageEmoji.nl}</option>
              <option value="en">English Only {languageEmoji.en}</option>
            </Select>
          </Stack>

          {/* Action Buttons */}
          <Box
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginTop: '32px',
              borderTop: '1px solid #2a2a2a',
              paddingTop: '24px'
            }}
          >
            <Button
              mode="ghost"
              text="Cancel"
              onClick={onClose}
              disabled={isSaving}
            />
            <Button
              tone="primary"
              type="submit"
              text={isSaving ? 'Saving...' : 'Save Changes'}
              disabled={isSaving || !validationState.source.isValid ||
                (destinationType === 'external' && !validationState.externalUrl.isValid)}
            />
          </Box>
        </Stack>
      </Box>
    </Dialog>
  )
}