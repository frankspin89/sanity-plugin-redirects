import { TextInput } from '@sanity/ui'
import { SearchIcon } from '@sanity/icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <TextInput
      icon={SearchIcon}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder="Search redirects..."
      fontSize={2}
      padding={3}
      radius={2}
      style={{
        width: '300px',
        '--card-fg-color': '#A3A3A3',
        '--card-bg-color': '#101112',
        '--card-border-color': '#2A2A2A'
      } as React.CSSProperties}
    />
  )
}