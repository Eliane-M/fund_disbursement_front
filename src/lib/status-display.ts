import type { AssessmentStatus, InvitationStatus, ReportShareStatus } from '@/types/assessment'

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
