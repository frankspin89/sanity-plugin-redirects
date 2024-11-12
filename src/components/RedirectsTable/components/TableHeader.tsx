import { Text, Box } from '@sanity/ui'
import { ArrowDownIcon } from '@sanity/icons'

export type SortField = 'source' | 'destination' | 'type' | 'language' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

interface TableHeaderProps {
  field: SortField
  label: string
  currentSort: { field: SortField; direction: SortDirection }
  onSort: (field: SortField) => void
  align?: 'left' | 'center' | 'right'
}

export function TableHeader({
  field,
  label,
  currentSort,
  onSort,
  align = 'left'
}: TableHeaderProps) {
  const isActive = currentSort.field === field

  return (
    <th style={{
      padding: '10px 16px',
      textAlign: align,
      color: '#A3A3A3',
      fontWeight: 'normal',
      borderBottom: '1px solid #2A2A2A',
      fontSize: '12px'
    }}>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          justifyContent: align === 'right' ? 'flex-end' : 'flex-start'
        }}
        onClick={() => onSort(field)}
      >
        <Text size={0}>{label}</Text>
        {isActive && (
          <ArrowDownIcon
            style={{
              transform: currentSort.direction === 'asc' ? 'rotate(180deg)' : 'none',
              opacity: 0.5,
              width: '14px',
              height: '14px'
            }}
          />
        )}
      </Box>
    </th>
  )
}