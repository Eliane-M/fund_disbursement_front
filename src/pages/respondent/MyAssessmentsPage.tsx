import { useQuery } from '@tanstack/react-query'
import { Link, Navigate } from 'react-router-dom'

import { RespondentLayout } from '@/components/respondent/RespondentLayout'
import { StatTile } from '@/components/console/StatTile'
import { Badge } from '@/components/ui/Badge'
import { assessmentApi } from '@/lib/assessment-api'
import { invitationStatusTone } from '@/lib/status-display'
import type { MyInvitation } from '@/types/assessment'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MyAssessmentsPage() {
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['my-assessments'],
    queryFn: assessmentApi.myAssessments,
  })
  const { data: reports } = useQuery({
    queryKey: ['my-reports'],
    queryFn: assessmentApi.myReports,
  })

  const organizations = [...new Set((invitations ?? []).map((i: MyInvitation) => i.organization_name))]
  const respondentName = invitations?.[0]?.respondent_name
  const submittedCount = invitations?.filter((i) => i.status === 'submitted').length ?? 0

  const openInvitations = (invitations ?? []).filter((i) => i.status !== 'submitted')
  const target = openInvitations.length === 1 ? openInvitations[0] : invitations?.length === 1 ? invitations[0] : null
  if (target) return <Navigate to={`/my/assessments/${target.id}`} replace />

  return (
    <RespondentLayout
      title={respondentName ? `Welcome, ${respondentName}` : 'Your assessments'}
      subtitle={
        organizations.length > 0
          ? `Invited by ${organizations.join(', ')}`
          : 'Assessments you have been invited to will appear here.'
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Assessments invited to" value={invitations?.length ?? '—'} />
        <StatTile label="Submitted" value={isLoading ? '—' : submittedCount} />
        <StatTile label="Scores available" value={reports?.length ?? '—'} />
      </div>

      <section className="mt-6 rounded-2xl border border-cream-300 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-navy-900">Your assessments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Assessment</th>
                <th className="pb-3 font-medium">Invited by</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Due</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {invitations?.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="py-3">
                    <p className="font-medium text-navy-900">{invitation.assessment_name}</p>
                    <p className="text-xs text-navy-500">
                      {invitation.category_name || 'Uncategorised'} · {invitation.assessment_version_label}
                    </p>
                  </td>
                  <td className="py-3 text-navy-700">{invitation.organization_name}</td>
                  <td className="py-3">
                    <Badge tone={invitationStatusTone[invitation.status]}>
                      {invitation.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 text-navy-700">{formatDate(invitation.due_date)}</td>
                  <td className="py-3">
                    {invitation.report ? (
                      <span className="font-medium text-navy-900">
                        {Number(invitation.report.overall_score).toFixed(0)}/100
                      </span>
                    ) : (
                      <span className="text-xs text-navy-500">
                        {invitation.status === 'submitted' ? 'Awaiting results' : 'Not shared yet'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/my/assessments/${invitation.id}`}
                      className="text-sm font-semibold text-teal-600 hover:underline"
                    >
                      {invitation.status === 'submitted'
                        ? 'View answers →'
                        : invitation.status === 'in_progress'
                          ? 'Continue →'
                          : 'Start →'}
                    </Link>
                  </td>
                </tr>
              ))}
              {invitations?.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-navy-500">
                    You haven't been invited to any assessments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </RespondentLayout>
  )
}
