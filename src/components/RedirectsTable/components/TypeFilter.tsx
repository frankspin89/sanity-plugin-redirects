import { Select } from '@sanity/ui'

interface TypeFilterProps {
  value: string
  onChange: (value: string) => void
  contentTypes: string[]
}

export function TypeFilter({ value, onChange, contentTypes }: TypeFilterProps) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      fontSize={2}
      padding={3}
      space={3}
      radius={2}
      style={{
        minWidth: '160px',
        '--card-fg-color': '#A3A3A3',
        '--card-bg-color': '#101112',
        '--card-border-color': '#2A2A2A'
      } as React.CSSProperties}
    >
      {contentTypes.map(type => (
        <option key={type} value={type}>
          {type === 'all'
            ? 'All Content'
            : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
        </option>
      ))}
    </Select>
  )
}