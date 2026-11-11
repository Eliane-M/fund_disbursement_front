import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useOrganization } from '@/hooks/useOrganization'
import { assessmentApi } from '@/lib/assessment-api'
import { assessmentStatusTone } from '@/lib/status-display'

export function AssessmentsListPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const [search, setSearch] = useState('')

  const { data: assessments } = useQuery({
    queryKey: ['assessments', orgId],
    queryFn: () => assessmentApi.assessments(orgId),
  })

  const filtered = assessments?.filter(
    (a) =>
      !search.trim() ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category_name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <ConsoleLayout title="Assessment Builder">
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category…"
          className="w-64 rounded-lg border border-cream-300 bg-white px-3.5 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        />
        <Link to="/assessment/builder/new">
          <Button fullWidth={false} className="px-4 py-2">
            + New assessment
          </Button>
        </Link>
      </div>

      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Framework</th>
                <th className="pb-3 font-medium">Version</th>
                <th className="pb-3 font-medium">Respondents</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filtered?.map((a) => (
                <tr key={a.id}>
                  <td className="py-3">
                    <p className="font-medium text-navy-900">{a.name}</p>
                    <p className="text-xs text-navy-500">{a.category_name}</p>
                  </td>
                  <td className="py-3 text-navy-700">{a.version_label}</td>
                  <td className="py-3 text-navy-700">{a.respondent_count} respondents</td>
                  <td className="py-3">
                    <Badge tone={assessmentStatusTone[a.status]}>{a.status}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Link to={`/assessment/builder/${a.id}`} className="text-sm font-semibold text-teal-600 hover:underline">
                      Open builder →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-navy-500">
                    No assessments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ConsoleLayout>
  )
}
