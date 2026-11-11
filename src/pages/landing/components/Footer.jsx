import Container from './Container.jsx';
import Logo from './Logo.jsx';
import { footerColumns } from '../data/content.js';

const socials = [
  {
    label: 'LinkedIn',
    path: 'M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.66 4.77 6.12V23h-4v-6.7c0-1.6-.03-3.65-2.22-3.65-2.23 0-2.57 1.74-2.57 3.54V23h-4V8.5z',
  },
  {
    label: 'X',
    path: 'M3 3l7.5 9.5L3.4 21h2.3l6-6.9L16.7 21H21l-7.9-10L20.5 3h-2.3l-5.5 6.3L8 3H3z',
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line pt-14 pb-8">
      <Container>
        <div className="grid grid-cols-2 gap-10 pb-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo className="h-20" />
            <p className="mt-3.5 max-w-[32ch] text-[0.94rem] text-ink-muted">
              Data Driven Decisions Partners. We help companies and individuals become data driven through training,
              products and strategy.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-sans text-[0.85rem] font-semibold text-ink-faint">{col.title}</h4>
              <ul className="flex flex-col gap-[11px]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[0.93rem] text-ink-muted no-underline hover:text-ink">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-line pt-6 text-[0.85rem] text-ink-faint">
          <span>© 2026 3DP, Data Driven Decisions Partners.</span>
          <div className="flex gap-3.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-line text-ink-muted no-underline"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[15px] w-[15px]" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
