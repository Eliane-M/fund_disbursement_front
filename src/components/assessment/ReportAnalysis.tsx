import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'

import type { CapabilityScore, ReportGap } from '@/types/assessment'

/** Radar, target benchmark bars and gap recommendations — shared by the staff and respondent report views. */
export function ReportAnalysis({ capabilityScores, gaps }: { capabilityScores: CapabilityScore[]; gaps: ReportGap[] }) {
  const radarData = capabilityScores.map((c) => ({
    capability: c.capability_name,
    score: Number(c.score_pct),
  }))

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-cream-300 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-navy-900">Scores by capability</h2>
          {radarData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#e8e2d2" />
                  <PolarAngleAxis dataKey="capability" tick={{ fill: '#17202e', fontSize: 11 }} />
                  <Radar dataKey="score" stroke="#101B2D" fill="#101B2D" fillOpacity={0.65} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-navy-500">No capability scores yet.</p>
          )}
        </section>

        <section className="rounded-2xl border border-cream-300 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-navy-900">Capability vs. target benchmark</h2>
          <div className="flex flex-col gap-4">
            {capabilityScores.map((c) => {
              const score = Number(c.score_pct)
              const target = c.target_score ? Number(c.target_score) : null
              return (
                <div key={c.capability}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-navy-800">{c.capability_name}</span>
                    <span className="text-navy-500">
                      {score.toFixed(0)} {target != null && `/ ${target.toFixed(0)}`}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full bg-cream-200">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{ width: `${Math.min(100, score)}%` }}
                    />
                    {target != null && (
                      <div
                        className="absolute top-[-2px] h-3 w-0.5 bg-navy-700"
                        style={{ left: `${Math.min(100, target)}%` }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-cream-300 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-navy-900">Identified gaps &amp; recommendations</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {gaps.map((gap) => (
            <div key={gap.id} className="rounded-xl border border-cream-300 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy-900">{gap.capability_name}</p>
                <span className="text-xs font-semibold text-danger-text">{Number(gap.score_pct).toFixed(0)}/100</span>
              </div>
              <p className="mt-1.5 text-sm text-navy-600">{gap.recommendation_text}</p>
            </div>
          ))}
          {gaps.length === 0 && <p className="text-sm text-navy-500">No gaps identified.</p>}
        </div>
      </section>
    </>
  )
}
