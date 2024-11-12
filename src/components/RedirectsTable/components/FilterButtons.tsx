import { Box, Label, Button } from '@sanity/ui'
import type { FilterButtonsProps } from '../types'

export function FilterButtons({ currentFilter, onFilterChange }: FilterButtonsProps) {
  return (
    <Box>
      <Label>Filter Redirects</Label>
      <Box marginTop={2}>
        <Button
          mode={currentFilter === 'all' ? 'default' : 'ghost'}
          onClick={() => onFilterChange('all')}
          text="All"
          style={{ marginRight: '8px' }}
        />
        <Button
          mode={currentFilter === 'active' ? 'default' : 'ghost'}
          onClick={() => onFilterChange('active')}
          text="Active"
          style={{ marginRight: '8px' }}
        />
        <Button
          mode={currentFilter === 'inactive' ? 'default' : 'ghost'}
          onClick={() => onFilterChange('inactive')}
          text="Inactive"
          style={{ marginRight: '8px' }}
        />
        <Button
          mode={currentFilter === 'issues' ? 'default' : 'ghost'}
          onClick={() => onFilterChange('issues')}
          text="Issues"
          tone="caution"
        />
      </Box>
    </Box>
  )
}