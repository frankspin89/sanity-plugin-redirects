import { Box, Switch, Spinner, Badge } from '@sanity/ui'
import type { StatusSwitchProps } from '../types'

export function StatusSwitch({ redirect, isUpdating, onStatusChange }: StatusSwitchProps) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: isUpdating ? 'wait' : 'pointer',
      }}
      title={`Click to ${redirect.isActive ? 'deactivate' : 'activate'} this redirect`}
    >
      <Switch
        checked={redirect.isActive}
        onChange={() => onStatusChange(redirect._id, !redirect.isActive)}
        disabled={isUpdating}
      />
      <Box>
        {isUpdating ? (
          <Spinner muted size={1} />
        ) : (
          <Badge tone={redirect.isActive ? 'positive' : 'caution'}>
            {redirect.isActive ? 'Active' : 'Inactive'}
          </Badge>
        )}
      </Box>
    </Box>
  )
}