export interface PlatformOrganization {
  id: string
  tenant_no: number
  name: string
  slug: string
  sector_focus: string
  org_type: string
  contact_email: string
  phone: string
  location: string
  country_code: string
  default_currency: string
  status: 'trial' | 'active' | 'suspended' | 'closed'
  member_count: number
  respondent_count: number
  created_at: string
}

export type UserStatus = 'pending' | 'active' | 'disabled'

export interface PlatformUser {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone_number: string
  status: UserStatus
  is_platform_admin: boolean
  membership_count: number
  date_joined: string
}

export interface PaginatedResult<T> {
  results: T[]
  count: number
  page: number
  page_size: number
}

export interface OrganizationAdminInput {
  first_name: string
  last_name: string
  email: string
  phone?: string
}
