import type { ReactNode } from 'react'

import { Logo } from '@/components/auth/Logo'

// const highlights = [
//   {
//     title: 'Maturity Assessment',
//     description: 'Score readiness, share reports, track gaps by capability.',
//   },
//   {
//     title: 'Fund Disbursement',
//     description: 'Track committed capital and approve installments with confidence.',
//   },
//   {
//     title: 'One respondent record',
//     description: 'Modules run independently but stay tied to a shared identity.',
//   },
// ]

export function AuthLayout({ children, title, subtitle, footer }: { children: ReactNode, title: string, subtitle?: string, footer?: ReactNode }) {
  return (
  <>
    <div className="flex min-h-svh bg-cream-100">
      {/* Left side - exactly 50% */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-900 px-10 py-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 15%, rgba(231,169,67,0.18), transparent 45%), radial-gradient(circle at 85% 85%, rgba(31,111,122,0.25), transparent 50%)',
          }}
          aria-hidden="true"
        />

        <div className="relative">
          <Logo variant="light" />

          <h1 className="mt-14 text-3xl font-semibold leading-tight text-white">
            Turning data into smarter decisions through training, data products, and
            digitization.
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-navy-400">
            One platform for tracking organizations, respondents, and committed capital
            across every module.
          </p>
        </div>

        {/* <ul className="relative flex flex-col gap-6">
          {highlights.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-white">
                  {item.title}
                </p>

                <p className="mt-0.5 text-sm text-navy-400">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul> */}

        <p className="relative text-xs text-navy-500">
          © {new Date().getFullYear()} Data Driven Decisions Partners
        </p>
      </aside>

      {/* Right side - exactly 50% */}
      <main className="flex w-1/2 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-cream-300 bg-white p-8 shadow-[0_10px_15px_-3px_rgba(23,32,46,0.05),0_4px_6px_-2px_rgba(23,32,46,0.03)]">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-navy-900">
                {title}
              </h2>

              {subtitle && (
                <p className="mt-1.5 text-sm text-navy-500">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-sm text-navy-500">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  </>
)}