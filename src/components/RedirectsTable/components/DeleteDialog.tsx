import { Box, Dialog, Stack, Text, Button, Spinner, Card } from '@sanity/ui'
import { TrashIcon } from '@sanity/icons'
import type { DeleteDialogProps } from '../types'
import { getInternalDestinationUrl } from '../utils'

export function DeleteDialog({ isOpen, redirect, onClose, onDelete, isDeleting }: DeleteDialogProps) {
  if (!redirect) return null

  return (
    <Dialog
      header={
        <Box padding={4} style={{ borderBottom: '1px solid var(--card-border-color)' }}>
          <Text weight="semibold" size={2}>Delete Redirect</Text>
        </Box>
      }
      id="delete-redirect-dialog"
      onClose={onClose}
      open={isOpen}
      width={2}
      zOffset={1000}
    >
      <Box padding={4}>
        <Stack space={4}>
          <Text>
            Are you sure you want to delete this redirect?
          </Text>

          <Card
            padding={3}
            radius={2}
            tone="caution"
          >
            <Stack space={3}>
              <Box style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Text size={1} style={{ width: '100px' }} weight="medium">Source:</Text>
                <Card padding={2} radius={1} tone="primary" style={{ flex: 1 }}>
                  <Text size={2} style={{ fontFamily: 'monospace' }}>{redirect.source}</Text>
                </Card>
              </Box>

              <Box style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Text size={1} style={{ width: '100px' }} weight="medium">Destination:</Text>
                <Card padding={2} radius={1} tone="primary" style={{ flex: 1 }}>
                  <Text size={2} style={{ fontFamily: 'monospace' }}>
                    {redirect.destinationType === 'external'
                      ? redirect.externalDestination
                      : getInternalDestinationUrl(redirect.internalDestination)}
                  </Text>
                </Card>
              </Box>
            </Stack>
          </Card>

          <Stack space={3} marginTop={4}>
            <Text size={1} muted>
              This action cannot be undone.
            </Text>

            <Box style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button
                mode="ghost"
                onClick={onClose}
                text="Cancel"
                disabled={isDeleting}
              />
              <Button
                tone="critical"
                onClick={onDelete}
                text={isDeleting ? 'Deleting...' : 'Delete'}
                icon={isDeleting ? undefined : TrashIcon}
                disabled={isDeleting}
              >
                {isDeleting && <Spinner muted />}
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  )
}