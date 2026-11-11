export type FundingType = 'grant' | 'loan' | 'equity_linked' | 'other'
export type Sequencing = 'sequential' | 'parallel'
export type FundLifecycleStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'suspended'
export type FundHealthStatus = 'on_track' | 'at_risk' | 'delayed' | 'completed'

export interface FundListItem {
  id: string
  organization: string
  recipient: string
  recipient_name: string
  title: string
  funding_type: FundingType
  total_amount: string
  currency: string
  lifecycle_status: FundLifecycleStatus
  health_status: FundHealthStatus
  milestone_count: number
  disbursed_total: string | null
  start_date: string
  end_date: string | null
  created_at: string
}

export interface Fund {
  id: string
  organization: string
  recipient: string
  recipient_name: string
  agreement_reference: string | null
  title: string
  funding_type: FundingType
  total_amount: string
  currency: string
  start_date: string
  end_date: string | null
  sequencing: Sequencing
  lifecycle_status: FundLifecycleStatus
  health_status: FundHealthStatus
  linked_report: string | null
  notes: string
  activated_at: string | null
  completed_at: string | null
  created_at: string
}

export type MilestoneStatus =
  | 'not_started'
  | 'locked'
  | 'open'
  | 'evidence_submitted'
  | 'under_review'
  | 'info_requested'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled'

export type InstallmentStatus =
  | 'not_started'
  | 'awaiting_evidence'
  | 'under_review'
  | 'info_requested'
  | 'approved'
  | 'ready_for_disbursement'
  | 'disbursed'
  | 'rejected'
  | 'cancelled'

export type MetricType = 'number' | 'percentage' | 'currency' | 'boolean' | 'date' | 'text'
export type Comparator = 'gte' | 'lte' | 'eq' | 'gt' | 'lt' | 'between'

export interface MilestoneKPI {
  id?: string
  name: string
  metric_type: MetricType
  comparator: Comparator
  target_value: string | number | null
  target_value_max: string | number | null
  target_text: string
  unit: string
  display_order: number
}

export interface MilestoneEvidenceRequirement {
  id?: string
  requirement_type: string | null
  label: string
  is_mandatory: boolean
  display_order: number
}

export interface InstallmentMini {
  id: string
  installment_no: number
  amount: string
  currency: string
  status: InstallmentStatus
  approved_at: string | null
  disbursed_at: string | null
}

export interface Milestone {
  id: string
  fund: string
  sequence_position: number
  title: string
  deliverable_description: string
  due_date: string | null
  unlocks_after_milestone: string | null
  status: MilestoneStatus
  kpis: MilestoneKPI[]
  evidence_requirements: MilestoneEvidenceRequirement[]
  installment: InstallmentMini
}

export interface MilestoneMini {
  id: string
  title: string
  sequence_position: number
  status: MilestoneStatus
}

export interface Installment {
  id: string
  fund: string
  milestone: MilestoneMini
  installment_no: number
  amount: string
  currency: string
  status: InstallmentStatus
  unlocked_at: string | null
  approved_at: string | null
  disbursed_at: string | null
  approved_by: string | null
}

export interface EvidenceFile {
  id: string
  external_url: string
  file_name: string
  file_size: number | null
  requirement: string | null
  uploaded_at: string
}

export interface KPIResult {
  id: string
  milestone_kpi: string
  kpi_name: string
  reported_value: string | null
  reported_text: string
  meets_target: boolean | null
  reviewer_note: string
}

export type EvidenceSubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'info_requested'

export interface EvidenceSubmission {
  id: string
  installment: string
  milestone: string
  attempt_no: number
  submitted_by: string | null
  submitted_by_name: string
  respondent_note: string
  status: EvidenceSubmissionStatus
  submitted_at: string
  reviewed_at: string | null
  files: EvidenceFile[]
  kpi_results: KPIResult[]
}

export type ReviewDecisionType = 'approved' | 'rejected' | 'info_requested'

export interface ReviewDecision {
  id: string
  submission: string
  installment: string
  reviewer_user: string
  reviewer_name: string
  decision: ReviewDecisionType
  comment: string
  decided_at: string
}

export type PaymentMethod = 'bank_transfer' | 'mobile_money' | 'cheque' | 'cash' | 'other' | ''

export interface DisbursementRecord {
  id: string
  installment: string
  amount_paid: string
  currency: string
  fx_rate_to_fund_ccy: string | null
  payment_reference: string
  payment_method: PaymentMethod
  paid_at: string
  recorded_by: string | null
  note: string
}

export interface InstallmentDetail extends Installment {
  submissions: EvidenceSubmission[]
  decisions: ReviewDecision[]
  disbursements: DisbursementRecord[]
}

export interface ReviewQueueItem {
  id: string
  fund_id: string
  fund_title: string
  recipient_name: string
  milestone: MilestoneMini
  installment_no: number
  amount: string
  currency: string
  status: InstallmentStatus
  unlocked_at: string | null
  latest_submission: {
    id: string
    attempt_no: number
    status: EvidenceSubmissionStatus
    submitted_at: string
  } | null
}

export interface EvidenceRequirementType {
  id: string
  organization: string
  label: string
  description: string
  is_active: boolean
}

export interface FundDashboardStats {
  active_funds: number
  total_committed: number
  total_disbursed: number
  installments_pending_review: number
}

export interface MyFundListItem extends FundListItem {
  organization_name: string
}

export interface MyFundDetail extends Fund {
  organization_name: string
  milestone_total: number
  milestones: Milestone[]
}
