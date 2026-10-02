import { api } from '@/lib/api'
import type { InviteMemberResult, Membership, MembershipRole, Organization, Respondent } from '@/types/assessment'

export const coreApi = {
  organizations() {
    return api.get<Organization[]>('/core/organizations/').then((r) => r.data)
  },
  // Self-serve org creation is disabled on the backend (POST is commented out
  // in apps/core/views.py) — organizations are now created by a platform admin
  // via platformApi.createOrganization. This wrapper is kept so
  // CreateOrganizationForm.tsx still compiles; its call sites are commented
  // out in RequireOrganization.tsx. One-line revert if that changes.
  createOrganization(payload: { name: string; sector_focus?: string; country_code?: string }) {
    return api.post<Organization>('/core/organizations/', payload).then((r) => r.data)
  },
  respondents(organizationId: string) {
    return api
      .get<Respondent[]>('/core/respondents/', { params: { organization: organizationId } })
      .then((r) => r.data)
  },
  createRespondent(organizationId: string, payload: Partial<Respondent>) {
    return api
      .post<Respondent>('/core/respondents/', payload, { params: { organization: organizationId } })
      .then((r) => r.data)
  },
  members(organizationId: string) {
    return api.get<Membership[]>(`/core/organizations/${organizationId}/members/`).then((r) => r.data)
  },
  inviteMember(
    organizationId: string,
    payload: { email: string; first_name?: string; last_name?: string; role: MembershipRole; respondent?: string | null },
  ) {
    return api
      .post<InviteMemberResult>(`/core/organizations/${organizationId}/members/`, payload)
      .then((r) => r.data)
  },
  updateMembership(id: string, payload: { role?: MembershipRole; status?: string }) {
    return api.patch<Membership>(`/core/memberships/${id}/`, payload).then((r) => r.data)
  },
  removeMembership(id: string) {
    return api.delete(`/core/memberships/${id}/`)
  },
}
