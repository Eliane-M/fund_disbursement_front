import type { ReactNode } from 'react'

import threeDpLogo from '@/assets/images/3dp-logo.svg'
import threeDpLogoLight from '@/assets/images/3dp-logo-light.svg'

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
      <aside className="relative hidden w-1/2 flex-col items-center justify-between overflow-hidden bg-[#f7f7f7] px-10 py-12 text-navy-900 lg:flex">
        <div aria-hidden="true" />

        <div className="relative flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
          <img src={threeDpLogo} alt="3DP Logo" className="h-auto w-full" />

          {/* <h1 className="mt-12 text-3xl font-semibold leading-tight text-white">
            Turning data into smarter decisions through training, data products, and
            digitization.
          </h1> */}

          <p className="mt-8 text-s leading-relaxed text-navy-600">
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

        <p className="relative text-sm text-navy-500">
          © {new Date().getFullYear()} Data Driven Decisions Partners
        </p>
      </aside>

      {/* Right side - exactly 50% */}
      <main className="flex w-full flex-col bg-navy-900 lg:w-1/2 items-center justify-center px-6 py-12 sm:px-10">
        <div className="mb-8 lg:hidden">
          <img src={threeDpLogoLight} alt="3DP Logo" className="h-20 w-auto" />
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
            <div className="mt-6 text-center text-sm text-navy-300 [&_a]:text-amber-400">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  </>
)}