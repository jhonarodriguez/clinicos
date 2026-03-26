// =============================================================================
// Tipos comunes reutilizables en API y Web
// =============================================================================

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export type SortOrder = 'asc' | 'desc'

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: SortOrder
}
