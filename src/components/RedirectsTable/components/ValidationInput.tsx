import React from 'react'
import { Stack, Text, TextInput, Card } from '@sanity/ui'
import { WarningOutlineIcon, ErrorOutlineIcon } from '@sanity/icons'
import { type Path } from '@sanity/types'

interface ValidationInputProps {
  value?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement> | any) => void
  validation?: Array<{
    level: 'error' | 'warning'
    item?: { message: string }
    message?: string
  }>
  path?: Path
  schemaType?: any // For Sanity schema context
  [key: string]: any
}

export function ValidationInput({
  value,
  onChange,
  validation = [],
  path = [],
  schemaType,
  elementProps,
  renderDefault,
  focused,
  changed,
  validationError,
  ...rest
}: ValidationInputProps) {
  // Normalize validation data structure
  const messages = validation.map(marker => ({
    level: marker.level,
    message: marker.item?.message || marker.message || ''
  }))

  const errors = messages
    .filter((marker) => marker.level === 'error')
    .map((marker) => marker.message)

  const warnings = messages
    .filter((marker) => marker.level === 'warning')
    .map((marker) => marker.message)

  return (
    <Stack space={2}>
      <TextInput
        value={value || ''}
        onChange={onChange}
        tone={errors.length > 0 ? 'critical' : warnings.length > 0 ? 'caution' : 'default'}
        {...rest}
      />
      {errors.length > 0 && (
        <Card padding={4} tone="critical" border radius={2} style={{ background: '#2B1618' }}>
          <Stack space={2}>
            {errors.map((error, i) => (
              <Text key={i} size={1}>
                <ErrorOutlineIcon style={{
                  marginRight: '4px',
                  display: 'inline-block'
                }} />
                <span>{error}</span>
              </Text>
            ))}
          </Stack>
        </Card>
      )}
      {warnings.length > 0 && !errors.length && (
        <Card padding={3} tone="caution" border radius={2}>
          <Stack space={2}>
            {warnings.map((warning, i) => (
              <Text key={i} size={1}>
                <WarningOutlineIcon style={{
                  marginRight: '4px',
                  display: 'inline-block'
                }} />
                <span>{warning}</span>
              </Text>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  )
}