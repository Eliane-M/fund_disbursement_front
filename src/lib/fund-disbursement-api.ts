import { api } from '@/lib/api'
import type {
  DisbursementRecord,
  EvidenceRequirementType,
  EvidenceSubmission,
  Fund,
  FundDashboardStats,
  FundListItem,
  Installment,
  InstallmentDetail,
  Milestone,
  MyFundDetail,
  MyFundListItem,
  MilestoneEvidenceRequirement,
  MilestoneKPI,
  PaymentMethod,
  ReviewQueueItem,
} from '@/types/fund-disbursement'

export type EvidencePayload = {
  respondent_note?: string
  links: string[]
  uploads: File[]
  kpi_results: { milestone_kpi: string; reported_value?: string | number | null }[]
}

function evidenceForm(payload: EvidencePayload) {
  const form = new FormData()
  form.append('respondent_note', payload.respondent_note ?? '')
  form.append('kpi_results', JSON.stringify(payload.kpi_results))
  payload.links.forEach((l) => form.append('links', l))
  payload.uploads.forEach((f) => form.append('uploads', f))
  return form
}

export const fundDisbursementApi = {
  dashboard(organizationId: string) {
    return api
      .get<FundDashboardStats>('/fund-disbursement/dashboard/', { params: { organization: organizationId } })
      .then((r) => r.data)
  },

  evidenceRequirementTypes(organizationId: string) {
    return api
      .get<EvidenceRequirementType[]>('/fund-disbursement/evidence-requirement-types/', {
        params: { organization: organizationId },
      })
      .then((r) => r.data)
  },

  funds(organizationId: string) {
    return api
      .get<FundListItem[]>('/fund-disbursement/funds/', { params: { organization: organizationId } })
      .then((r) => r.data)
  },
  fund(id: string) {
    return api.get<Fund>(`/fund-disbursement/funds/${id}/`).then((r) => r.data)
  },
  createFund(organizationId: string, payload: Partial<Fund>) {
    return api
      .post<Fund>('/fund-disbursement/funds/', payload, { params: { organization: organizationId } })
      .then((r) => r.data)
  },
  updateFund(id: string, payload: Partial<Fund>) {
    return api.patch<Fund>(`/fund-disbursement/funds/${id}/`, payload).then((r) => r.data)
  },
  transitionFund(id: string, status: string) {
    return api.post<Fund>(`/fund-disbursement/funds/${id}/lifecycle/`, { status }).then((r) => r.data)
  },

  milestones(fundId: string) {
    return api.get<Milestone[]>(`/fund-disbursement/funds/${fundId}/milestones/`).then((r) => r.data)
  },
  createMilestone(
    fundId: string,
    payload: {
      sequence_position: number
      title: string
      deliverable_description?: string
      due_date?: string | null
      unlocks_after_milestone?: string | null
      amount: string | number
      currency?: string
      kpis?: MilestoneKPI[]
      evidence_requirements?: MilestoneEvidenceRequirement[]
    },
  ) {
    return api.post<Milestone>(`/fund-disbursement/funds/${fundId}/milestones/`, payload).then((r) => r.data)
  },
  updateMilestone(id: string, payload: Partial<Milestone>) {
    return api.patch<Milestone>(`/fund-disbursement/milestones/${id}/`, payload).then((r) => r.data)
  },
  deleteMilestone(id: string) {
    return api.delete(`/fund-disbursement/milestones/${id}/`)
  },

  installments(fundId: string) {
    return api.get<Installment[]>(`/fund-disbursement/funds/${fundId}/installments/`).then((r) => r.data)
  },
  installment(id: string) {
    return api.get<InstallmentDetail>(`/fund-disbursement/installments/${id}/`).then((r) => r.data)
  },
  submitEvidence(installmentId: string, payload: EvidencePayload) {
    return api
      .post<EvidenceSubmission>(`/fund-disbursement/installments/${installmentId}/submit-evidence/`, evidenceForm(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  decideSubmission(submissionId: string, decision: 'approved' | 'rejected' | 'info_requested', comment: string) {
    return api
      .post<EvidenceSubmission>(`/fund-disbursement/submissions/${submissionId}/decide/`, { decision, comment })
      .then((r) => r.data)
  },
  disburse(
    installmentId: string,
    payload: {
      amount_paid: string | number
      currency?: string
      payment_reference?: string
      payment_method?: PaymentMethod
      paid_at: string
      note?: string
    },
  ) {
    return api
      .post<DisbursementRecord>(`/fund-disbursement/installments/${installmentId}/disburse/`, payload)
      .then((r) => r.data)
  },

  reviewQueue(organizationId: string) {
    return api
      .get<ReviewQueueItem[]>('/fund-disbursement/review-queue/', { params: { organization: organizationId } })
      .then((r) => r.data)
  },

  myFunds() {
    return api.get<MyFundListItem[]>('/fund-disbursement/my/funds/').then((r) => r.data)
  },
  myFund(id: string) {
    return api.get<MyFundDetail>(`/fund-disbursement/my/funds/${id}/`).then((r) => r.data)
  },
  myInstallment(id: string) {
    return api.get<InstallmentDetail>(`/fund-disbursement/my/installments/${id}/`).then((r) => r.data)
  },
  mySubmitEvidence(installmentId: string, payload: EvidencePayload) {
    return api
      .post<EvidenceSubmission>(`/fund-disbursement/my/installments/${installmentId}/submit-evidence/`, evidenceForm(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  async downloadEvidenceFile(id: string, filename: string) {
    const res = await api.get<Blob>(`/fund-disbursement/evidence-files/${id}/download/`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },
}
