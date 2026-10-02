export interface UserMembership {
  id: string
  organization: string
  organization_name: string
  role: 'org_admin' | 'reviewer' | 'respondent'
  status: 'invited' | 'active' | 'suspended'
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone_number: string
  is_email_verified: boolean
  is_first_login: boolean
  is_platform_admin: boolean
  memberships: UserMembership[]
  date_joined: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthPayload {
  user: User
  access: string
  refresh: string
}

export interface LoginOtpRequired {
  otp_required: true
  detail: string
  code: 'otp_required'
}

export type LoginResult = AuthPayload | LoginOtpRequired

export type OtpPurpose = 'email_verification' | 'first_login' | 'password_reset'

export interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  phone_number?: string
}

export interface DetailResponse {
  detail: string
}

export interface ApiFieldErrors {
  [field: string]: string[] | string | ApiFieldErrors
}
