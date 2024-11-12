import { format } from 'date-fns'
import { EditIcon, TrashIcon } from '@sanity/icons'
import { Button, Text } from '@sanity/ui'
import { tableStyles } from '../styles'
import { getInternalDestinationUrl } from '../utils'
import type { TableRowProps } from '../types'
import { StatusSwitch } from './StatusSwitch'

export function TableRow({ redirect, ...props }: TableRowProps) {
  const destinationPath = redirect.destinationType === 'external'
    ? redirect.externalDestination
    : getInternalDestinationUrl(redirect.internalDestination)

  return (
    <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
      <td style={{ ...tableStyles.base, width: '40px', textAlign: 'center', padding: '10px 8px' }}>
        <StatusSwitch
          redirect={redirect}
          isUpdating={props.isUpdating}
          onStatusChange={props.onStatusChange}
        />
      </td>
      <td style={{
        ...tableStyles.base,
        textAlign: 'left',
        color: '#A3A3A3',
        whiteSpace: 'nowrap',
        width: '100px'
      }}>
        <Text size={0}>
          {format(new Date(redirect._createdAt), 'MMM d, \'24')}
        </Text>
      </td>
      <td style={{ ...tableStyles.base }}>
        {redirect.source}
      </td>
      <td style={{ ...tableStyles.base }}>
        {destinationPath}
      </td>
      <td style={{ ...tableStyles.base, textAlign: 'center' }}>
        <span style={{
          background: '#1C2A1C',
          color: '#4CAF50',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '12px'
        }}>
          {redirect.type === 'permanent' ? '301' : '302'}
        </span>
      </td>
      <td style={{ ...tableStyles.base, textAlign: 'center' }}>
        <span style={{ fontSize: '12px' }}>
          {redirect.language === 'nl' ? '🇳🇱' : '🇬🇧'}
        </span>
      </td>
      <td style={{ ...tableStyles.base, textAlign: 'center' }}>
        {redirect.redirectChain && (
          <Text size={0} style={{ color: '#FFA726' }}>Chain</Text>
        )}
        {redirect.brokenDestination && (
          <Text size={0} style={{ color: '#EF5350' }}>Broken</Text>
        )}
      </td>
      <td style={{ ...tableStyles.base, textAlign: 'right' }}>
        <div style={{
          display: 'flex',
          gap: '4px',
          justifyContent: 'flex-end'
        }}>
          <Button
            icon={EditIcon}
            mode="ghost"
            onClick={() => props.onEditClick(redirect)}
            disabled={props.isSaving}
            padding={2}
            fontSize={1}
            style={{
              minWidth: '24px',
              height: '24px'
            }}
          />
          <Button
            icon={TrashIcon}
            mode="ghost"
            tone="critical"
            onClick={() => props.onDeleteClick(redirect)}
            disabled={props.isDeleting}
            padding={2}
            fontSize={1}
            style={{
              minWidth: '24px',
              height: '24px'
            }}
          />
        </div>
      </td>
    </tr>
  )
}