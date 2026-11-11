export interface Organization {
  id: string
  tenant_no: number
  name: string
  slug: string
  sector_focus: string
  country_code: string
  default_currency: string
  status: 'trial' | 'active' | 'suspended' | 'closed'
  role: 'org_admin' | 'reviewer' | 'respondent'
  modules: string[]
}

export type MembershipRole = 'org_admin' | 'reviewer' | 'respondent'
export type MembershipStatus = 'invited' | 'active' | 'suspended'

export interface Membership {
  id: string
  user: string
  email: string
  full_name: string
  role: MembershipRole
  status: MembershipStatus
  respondent: string | null
  respondent_name: string
  invited_at: string
  accepted_at: string | null
}

export interface InviteMemberResult extends Membership {
  email_sent: boolean
}

export interface Respondent {
  id: string
  organization: string
  respondent_type: 'company' | 'cooperative' | 'sme' | 'corporate' | 'individual'
  name: string
  legal_name: string
  registration_no: string
  sector_tag: string
  category: string | null
  category_name: string
  primary_contact_name: string
  primary_contact_email: string
  primary_contact_phone: string
  country_code: string
  district: string
  address: string
  status: 'active' | 'inactive' | 'archived'
  external_reference: string
  notes: string
  created_at: string
}

export interface Category {
  id: string
  organization: string
  name: string
  description: string
  auto_share_reports: boolean
  is_archived: boolean
  created_at: string
}

export type AssessmentStatus = 'draft' | 'live' | 'archived'
export type AssessmentRespondentType = 'organization' | 'individual' | 'any'

export interface AssessmentListItem {
  id: string
  organization: string
  category: string
  category_name: string
  name: string
  version_label: string
  respondent_type: AssessmentRespondentType
  status: AssessmentStatus
  respondent_count: number
  published_at: string | null
  created_at: string
}

export interface Assessment {
  id: string
  organization: string
  category: string
  category_name: string
  name: string
  version_label: string
  description: string
  respondent_type: AssessmentRespondentType
  status: AssessmentStatus
  gap_threshold_pct: string
  auto_share_reports: boolean | null
  default_target_score: string
  current_version: string | null
  published_at: string | null
  archived_at: string | null
  created_at: string
}

export interface SubCapability {
  id: string
  capability: string
  name: string
  description: string
  display_order: number
  is_archived: boolean
  created_at: string
}

export interface Capability {
  id: string
  assessment: string
  name: string
  description: string
  weight_pct: string
  target_score: string | null
  display_order: number
  is_archived: boolean
  sub_capabilities: SubCapability[]
  created_at: string
}

export type QuestionType = 'single_select' | 'multi_select' | 'likert_5' | 'numeric' | 'yes_no' | 'free_text'

export interface QuestionOption {
  id?: string
  label: string
  score_value: string | number
  likert_position: number | null
  display_order: number
}

export interface QuestionNumericRule {
  id?: string
  min_value: string | number
  max_value: string | number
  score_value: string | number
  display_order: number
}

export interface Question {
  id: string
  assessment: string
  capability: string
  sub_capability: string | null
  question_text: string
  help_text: string
  question_type: QuestionType
  is_required: boolean
  is_scored: boolean
  allow_not_applicable: boolean
  max_points: string
  numeric_unit: string
  numeric_min: string | null
  numeric_max: string | null
  display_order: number
  page_no: number
  is_archived: boolean
  options: QuestionOption[]
  numeric_rules: QuestionNumericRule[]
}

export interface MaturityBand {
  id: string
  assessment: string
  label: string
  min_score: string
  max_score: string
  color_hex: string
  display_order: number
}

export interface Recommendation {
  id: string
  assessment: string
  capability: string
  band: string | null
  recommendation_text: string
  display_order: number
}

export type InvitationStatus = 'invited' | 'in_progress' | 'submitted' | 'expired' | 'cancelled'

export interface AssessmentInvitation {
  id: string
  organization: string
  assessment: string
  assessment_version: string
  respondent: string
  respondent_name: string
  status: InvitationStatus
  due_date: string | null
  sent_at: string | null
  started_at: string | null
  submitted_at: string | null
  reminder_count: number
  expires_at: string | null
}

export type ReportShareStatus = 'draft' | 'shared' | 'withheld'

export interface ReportListItem {
  id: string
  respondent: string
  respondent_name: string
  category_name: string
  overall_score: string
  maturity_band_label: string
  share_status: ReportShareStatus
  generated_at: string
}

export interface CapabilityScore {
  capability: string
  capability_name: string
  sub_capability: string | null
  score_pct: string
  score_10: string
  weight_pct: string
  target_score: string | null
  is_gap: boolean
}

export interface ReportGap {
  id: string
  capability: string
  capability_name: string
  score_pct: string
  recommendation_text: string
  display_order: number
}

export interface ReportDetail {
  id: string
  organization: string
  respondent: string
  respondent_name: string
  category_name: string
  overall_score: string
  maturity_band_label: string
  share_status: ReportShareStatus
  share_token: string | null
  submitted_at: string | null
  generated_at: string
  capability_scores: CapabilityScore[]
  gaps: ReportGap[]
}

export interface MyReportDetail {
  id: string
  organization: string
  organization_name: string
  respondent: string
  respondent_name: string
  assessment_name: string
  category_name: string
  overall_score: string
  maturity_band_label: string
  submitted_at: string | null
  shared_at: string | null
  generated_at: string
  capability_scores: CapabilityScore[]
  gaps: ReportGap[]
}

export interface DashboardStats {
  active_assessments: number
  respondents_invited: number
  avg_maturity_score: number | null
  reports_shared: number
}

// --- Respondent-facing ("my") shapes ------------------------------------

export interface MyInvitationReport {
  id: string
  overall_score: string
  maturity_band_label: string
  shared_at: string | null
}

export interface MyInvitation {
  id: string
  organization: string
  organization_name: string
  assessment: string
  assessment_name: string
  assessment_version_label: string
  category_name: string
  respondent: string
  respondent_name: string
  status: InvitationStatus
  due_date: string | null
  sent_at: string | null
  started_at: string | null
  submitted_at: string | null
  created_at: string
  report: MyInvitationReport | null
}

export interface MyReport {
  id: string
  organization: string
  organization_name: string
  respondent: string
  respondent_name: string
  assessment_name: string
  category_name: string
  overall_score: string
  maturity_band_label: string
  submitted_at: string | null
  shared_at: string | null
  generated_at: string
}

// --- Filling in an assessment -------------------------------------------

export interface QuestionnaireOption {
  id: string
  label: string
  likert_position: number | null
  display_order: number
}

export interface QuestionnaireQuestion {
  id: string
  capability: string
  sub_capability: string | null
  question_text: string
  help_text: string
  question_type: QuestionType
  is_required: boolean
  allow_not_applicable: boolean
  numeric_unit: string
  numeric_min: string | null
  numeric_max: string | null
  display_order: number
  page_no: number
  options: QuestionnaireOption[]
}

export interface MyResponse {
  question: string
  answer_value: unknown
  is_not_applicable: boolean
  selected_options: string[]
  answered_at: string
}

export interface Questionnaire {
  invitation: MyInvitation
  capabilities: Capability[]
  questions: QuestionnaireQuestion[]
  responses: MyResponse[]
}

export interface AnswerInput {
  question: string
  answer_value?: unknown
  selected_options?: string[]
  is_not_applicable?: boolean
}

export interface SubmitResult {
  detail: string
  pending_review: number
  report_generated: boolean
  invitation: MyInvitation
}

export interface ReviewQueueItem {
  id: string
  organization: string
  assessment: string
  assessment_name: string
  respondent: string
  respondent_name: string
  status: InvitationStatus
  submitted_at: string | null
  pending_review: number
  free_text_count: number
  report_id: string | null
  overall_score: string | null
}

export interface PendingResponse {
  id: string
  invitation: string
  question: string
  question_text: string
  is_scored: boolean
  capability_name: string
  respondent_name: string
  assessment_name: string
  answer_value: unknown
  max_points: string
  reviewer_score: string | null
  reviewed_at: string | null
  answered_at: string
}

export interface GradeResult {
  response: PendingResponse
  overall_score: string
  maturity_band_label: string
  pending_review: number
}

export interface AppNotification {
  id: string
  organization: string
  template_key: string
  subject: string
  payload: Record<string, unknown>
  related_entity_type: string
  related_entity_id: string | null
  status: string
  read_at: string | null
  created_at: string
}
