import type { AssessmentStatus, InvitationStatus, ReportShareStatus } from '@/types/assessment'
import type { FundHealthStatus, FundLifecycleStatus, InstallmentStatus } from '@/types/fund-disbursement'

type Tone = 'success' | 'trial' | 'danger' | 'neutral' | 'amber'

export const assessmentStatusTone: Record<AssessmentStatus, Tone> = {
  live: 'success',
  draft: 'trial',
  archived: 'neutral',
}

export const invitationStatusTone: Record<InvitationStatus, Tone> = {
  submitted: 'success',
  in_progress: 'amber',
  invited: 'neutral',
  expired: 'danger',
  cancelled: 'danger',
}

export const reportShareStatusTone: Record<ReportShareStatus, Tone> = {
  shared: 'success',
  draft: 'neutral',
  withheld: 'neutral',
}

export const reportShareStatusLabel: Record<ReportShareStatus, string> = {
  shared: 'Shared',
  draft: 'Draft',
  withheld: 'Held back',
}

const bandTextColor: Record<string, string> = {
  nascent: 'text-danger-text',
  developing: 'text-amber-600',
  established: 'text-navy-700',
  advanced: 'text-success-text',
}

export function maturityBandColor(label: string) {
  return bandTextColor[label.toLowerCase()] ?? 'text-navy-700'
}

export const fundLifecycleTone: Record<FundLifecycleStatus, Tone> = {
  draft: 'trial',
  active: 'success',
  completed: 'neutral',
  cancelled: 'danger',
  suspended: 'amber',
}

export const fundHealthTone: Record<FundHealthStatus, Tone> = {
  on_track: 'success',
  at_risk: 'amber',
  delayed: 'danger',
  completed: 'neutral',
}

export const fundHealthLabel: Record<FundHealthStatus, string> = {
  on_track: 'On track',
  at_risk: 'At risk',
  delayed: 'Delayed',
  completed: 'Completed',
}

export const installmentStatusTone: Record<InstallmentStatus, Tone> = {
  not_started: 'neutral',
  awaiting_evidence: 'trial',
  under_review: 'amber',
  info_requested: 'amber',
  approved: 'success',
  ready_for_disbursement: 'success',
  disbursed: 'success',
  rejected: 'danger',
  cancelled: 'danger',
}

export const installmentStatusLabel: Record<InstallmentStatus, string> = {
  not_started: 'Not started',
  awaiting_evidence: 'Awaiting evidence',
  under_review: 'Awaiting review',
  info_requested: 'Info requested',
  approved: 'Approved',
  ready_for_disbursement: 'Ready to disburse',
  disbursed: 'Disbursed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}
