export interface Redirect {
  _id: string
  source: string
  destinationType: 'internal' | 'external'
  externalDestination?: string
  internalDestination?: {
    _type: string
    _id: string
    slug?: { current: string }
    language?: string
  }
  type: 'permanent' | 'temporary'
  isActive: boolean
  language: 'all' | 'nl' | 'en'
  notes?: string
  lastTestedAt?: string
  _createdAt: string
  _updatedAt: string
  redirectChain?: string[]
  brokenDestination?: boolean
}

export interface DeleteDialogProps {
  isOpen: boolean
  redirect: Redirect | null
  onClose: () => void
  onDelete: () => Promise<void>
  isDeleting: boolean
}

export interface StatusSwitchProps {
  redirect: Redirect
  isUpdating: boolean
  onStatusChange: (redirectId: string, newStatus: boolean) => Promise<void>
}

export interface FilterButtonsProps {
  currentFilter: 'all' | 'active' | 'inactive' | 'issues'
  onFilterChange: (filter: 'all' | 'active' | 'inactive' | 'issues') => void
}

export interface TableRowProps {
  redirect: Redirect
  onStatusChange: (redirectId: string, newStatus: boolean) => Promise<void>
  onDeleteClick: (redirect: Redirect) => void
  onEditClick: (redirect: Redirect) => void
  isUpdating: boolean
  isDeleting: boolean
  isSaving: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  normalizedPath?: string
}