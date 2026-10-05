import { api } from '@/lib/api'
import type { DetailResponse } from '@/types/auth'
import type { InviteMemberResult, Membership, MembershipRole } from '@/types/assessment'
import type { OrganizationAdminInput, PaginatedResult, PlatformOrganization, PlatformUser, UserStatus } from '@/types/platform'

export interface ListParams {
  search?: string
  status?: string
  is_platform_admin?: boolean
  page?: number
  page_size?: number
}

export const platformApi = {
  organizations(params: ListParams = {}) {
    return api
      .get<PaginatedResult<PlatformOrganization>>('/platform/organizations/', { params })
      .then((r) => r.data)
  },
  createOrganization(payload: {
    name: string
    sector_focus?: string
    org_type?: string
    contact_email?: string
    phone?: string
    location?: string
    country_code?: string
    admin?: OrganizationAdminInput
  }) {
    return api.post<PlatformOrganization>('/platform/organizations/', payload).then((r) => r.data)
  },
  organization(id: string) {
    return api.get<PlatformOrganization>(`/platform/organizations/${id}/`).then((r) => r.data)
  },
  updateOrganizationStatus(id: string, status: PlatformOrganization['status']) {
    return api.patch<PlatformOrganization>(`/platform/organizations/${id}/`, { status }).then((r) => r.data)
  },
  updateOrganization(
    id: string,
    payload: Partial<
      Pick<
        PlatformOrganization,
        'name' | 'org_type' | 'sector_focus' | 'contact_email' | 'phone' | 'location' | 'status'
      >
    >,
  ) {
    return api.patch<PlatformOrganization>(`/platform/organizations/${id}/`, payload).then((r) => r.data)
  },
  members(organizationId: string) {
    return api.get<Membership[]>(`/platform/organizations/${organizationId}/members/`).then((r) => r.data)
  },
  inviteMember(
    organizationId: string,
    payload: { email: string; first_name?: string; last_name?: string; role: MembershipRole },
  ) {
    return api
      .post<InviteMemberResult>(`/platform/organizations/${organizationId}/members/`, payload)
      .then((r) => r.data)
  },
  users(params: ListParams = {}) {
    return api.get<PaginatedResult<PlatformUser>>('/platform/users/', { params }).then((r) => r.data)
  },
  createPlatformAdmin(payload: { email: string; first_name: string; last_name: string; phone_number?: string }) {
    return api.post<PlatformUser>('/platform/users/', payload).then((r) => r.data)
  },
  updateUser(
    userId: string,
    payload: { first_name?: string; last_name?: string; phone_number?: string; status?: UserStatus },
  ) {
    return api.patch<PlatformUser>(`/platform/users/${userId}/`, payload).then((r) => r.data)
  },
  deleteUser(userId: string) {
    return api.delete(`/platform/users/${userId}/`)
  },
  resetUserPassword(userId: string) {
    return api.post<DetailResponse>(`/platform/users/${userId}/reset-password/`).then((r) => r.data)
  },
  // Platform-admin status is intentionally not grantable/revocable from the UI
  // anymore — it's set directly in the backend (shell/admin) only.
  grantPlatformAdmin(userId: string) {
    return api.post(`/platform/users/${userId}/platform-admin/`).then((r) => r.data)
  },
  revokePlatformAdmin(userId: string) {
    return api.delete(`/platform/users/${userId}/platform-admin/`)
  },
}
