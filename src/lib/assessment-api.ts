import { api } from '@/lib/api'
import type {
  Assessment,
  AssessmentInvitation,
  AssessmentListItem,
  Capability,
  Category,
  DashboardStats,
  AnswerInput,
  GradeResult,
  MaturityBand,
  MyInvitation,
  MyReport,
  MyReportDetail,
  MyResponse,
  PendingResponse,
  Question,
  Questionnaire,
  Recommendation,
  ReportDetail,
  ReportListItem,
  ReportShareStatus,
  ReviewQueueItem,
  SubCapability,
  SubmitResult,
} from '@/types/assessment'

export const assessmentApi = {
  dashboard(organizationId: string) {
    return api
      .get<DashboardStats>('/assessment/dashboard/', { params: { organization: organizationId } })
      .then((r) => r.data)
  },

  categories(organizationId: string) {
    return api
      .get<Category[]>('/assessment/categories/', { params: { organization: organizationId } })
      .then((r) => r.data)
  },
  createCategory(organizationId: string, payload: Partial<Category>) {
    return api
      .post<Category>('/assessment/categories/', payload, { params: { organization: organizationId } })
      .then((r) => r.data)
  },

  assessments(organizationId: string) {
    return api
      .get<AssessmentListItem[]>('/assessment/assessments/', { params: { organization: organizationId } })
      .then((r) => r.data)
  },
  assessment(id: string) {
    return api.get<Assessment>(`/assessment/assessments/${id}/`).then((r) => r.data)
  },
  createAssessment(organizationId: string, payload: Partial<Assessment>) {
    return api
      .post<Assessment>('/assessment/assessments/', payload, { params: { organization: organizationId } })
      .then((r) => r.data)
  },
  updateAssessment(id: string, payload: Partial<Assessment>) {
    return api.patch<Assessment>(`/assessment/assessments/${id}/`, payload).then((r) => r.data)
  },
  publishAssessment(id: string) {
    return api.post<Assessment>(`/assessment/assessments/${id}/publish/`).then((r) => r.data)
  },
  archiveAssessment(id: string) {
    return api.post<Assessment>(`/assessment/assessments/${id}/archive/`).then((r) => r.data)
  },

  capabilities(assessmentId: string) {
    return api
      .get<Capability[]>(`/assessment/assessments/${assessmentId}/capabilities/`)
      .then((r) => r.data)
  },
  createCapability(assessmentId: string, payload: Partial<Capability>) {
    return api
      .post<Capability>(`/assessment/assessments/${assessmentId}/capabilities/`, payload)
      .then((r) => r.data)
  },
  updateCapability(id: string, payload: Partial<Capability>) {
    return api.patch<Capability>(`/assessment/capabilities/${id}/`, payload).then((r) => r.data)
  },
  deleteCapability(id: string) {
    return api.delete(`/assessment/capabilities/${id}/`)
  },

  createSubCapability(capabilityId: string, payload: Partial<SubCapability>) {
    return api
      .post<SubCapability>(`/assessment/capabilities/${capabilityId}/sub-capabilities/`, payload)
      .then((r) => r.data)
  },
  updateSubCapability(id: string, payload: Partial<SubCapability>) {
    return api.patch<SubCapability>(`/assessment/sub-capabilities/${id}/`, payload).then((r) => r.data)
  },
  deleteSubCapability(id: string) {
    return api.delete(`/assessment/sub-capabilities/${id}/`)
  },

  questions(assessmentId: string) {
    return api.get<Question[]>(`/assessment/assessments/${assessmentId}/questions/`).then((r) => r.data)
  },
  createQuestion(assessmentId: string, payload: Partial<Question>) {
    return api
      .post<Question>(`/assessment/assessments/${assessmentId}/questions/`, payload)
      .then((r) => r.data)
  },
  updateQuestion(id: string, payload: Partial<Question>) {
    return api.patch<Question>(`/assessment/questions/${id}/`, payload).then((r) => r.data)
  },
  deleteQuestion(id: string) {
    return api.delete(`/assessment/questions/${id}/`)
  },

  maturityBands(assessmentId: string) {
    return api
      .get<MaturityBand[]>(`/assessment/assessments/${assessmentId}/maturity-bands/`)
      .then((r) => r.data)
  },
  createMaturityBand(assessmentId: string, payload: Partial<MaturityBand>) {
    return api
      .post<MaturityBand>(`/assessment/assessments/${assessmentId}/maturity-bands/`, payload)
      .then((r) => r.data)
  },
  updateMaturityBand(id: string, payload: Partial<MaturityBand>) {
    return api.patch<MaturityBand>(`/assessment/maturity-bands/${id}/`, payload).then((r) => r.data)
  },
  deleteMaturityBand(id: string) {
    return api.delete(`/assessment/maturity-bands/${id}/`)
  },

  recommendations(capabilityId: string) {
    return api
      .get<Recommendation[]>(`/assessment/capabilities/${capabilityId}/recommendations/`)
      .then((r) => r.data)
  },
  createRecommendation(capabilityId: string, payload: Partial<Recommendation>) {
    return api
      .post<Recommendation>(`/assessment/capabilities/${capabilityId}/recommendations/`, payload)
      .then((r) => r.data)
  },
  updateRecommendation(id: string, payload: Partial<Recommendation>) {
    return api.patch<Recommendation>(`/assessment/recommendations/${id}/`, payload).then((r) => r.data)
  },
  deleteRecommendation(id: string) {
    return api.delete(`/assessment/recommendations/${id}/`)
  },

  invitations(assessmentId: string) {
    return api
      .get<AssessmentInvitation[]>(`/assessment/assessments/${assessmentId}/invitations/`)
      .then((r) => r.data)
  },
  createInvitation(assessmentId: string, respondentId: string, dueDate?: string) {
    return api
      .post<AssessmentInvitation>(`/assessment/assessments/${assessmentId}/invitations/`, {
        respondent: respondentId,
        due_date: dueDate,
      })
      .then((r) => r.data)
  },

  reports(organizationId: string) {
    return api
      .get<ReportListItem[]>('/assessment/reports/', { params: { organization: organizationId } })
      .then((r) => r.data)
  },
  report(id: string) {
    return api.get<ReportDetail>(`/assessment/reports/${id}/`).then((r) => r.data)
  },
  updateReportShareStatus(id: string, shareStatus: ReportShareStatus) {
    return api
      .patch<ReportDetail>(`/assessment/reports/${id}/`, { share_status: shareStatus })
      .then((r) => r.data)
  },

  myAssessments() {
    return api.get<MyInvitation[]>('/assessment/my/assessments/').then((r) => r.data)
  },
  myReports() {
    return api.get<MyReport[]>('/assessment/my/reports/').then((r) => r.data)
  },

  myReport(id: string) {
    return api.get<MyReportDetail>(`/assessment/my/reports/${id}/`).then((r) => r.data)
  },

  myAssessment(invitationId: string) {
    return api.get<Questionnaire>(`/assessment/my/assessments/${invitationId}/`).then((r) => r.data)
  },
  saveMyAnswers(invitationId: string, answers: AnswerInput[]) {
    return api
      .put<{ responses: MyResponse[] }>(`/assessment/my/assessments/${invitationId}/answers/`, { answers })
      .then((r) => r.data)
  },
  submitMyAssessment(invitationId: string) {
    return api.post<SubmitResult>(`/assessment/my/assessments/${invitationId}/submit/`).then((r) => r.data)
  },

  submissionQueue(organizationId: string) {
    return api
      .get<ReviewQueueItem[]>('/assessment/review-queue/', { params: { organization: organizationId } })
      .then((r) => r.data)
  },
  pendingResponses(invitationId: string) {
    return api
      .get<PendingResponse[]>(`/assessment/invitations/${invitationId}/pending-responses/`)
      .then((r) => r.data)
  },
  gradeResponse(responseId: string, reviewerScore: string) {
    return api
      .post<GradeResult>(`/assessment/responses/${responseId}/score/`, { reviewer_score: reviewerScore })
      .then((r) => r.data)
  },
}
