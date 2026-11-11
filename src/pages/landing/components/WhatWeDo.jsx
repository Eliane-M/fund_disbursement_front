import Section from './Section.jsx';
import { pillars } from '../data/content.js';

const icons = {
  train: <path d="M4 19V10M12 19V5M20 19V13" />,
  build: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </>
  ),
  advise: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
};

export default function WhatWeDo() {
  return (
    <Section
      id="what-we-do"
      title="Three ways we help you get there"
      intro="We meet you wherever you're starting from, whether that's a team that needs data skills, a business that needs a data product, or a strategy that needs to hold up under regulation."
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-line bg-line md:grid-cols-3">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="bg-elevated px-[30px] pt-[34px] pb-[30px]">
            <svg
              className="mb-5 h-[38px] w-[38px] text-accent-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              {icons[pillar.icon]}
            </svg>
            <h3 className="mb-2.5 text-[1.2rem]">{pillar.title}</h3>
            <p className="mb-[18px] text-[0.98rem] text-ink-muted">{pillar.text}</p>
            <ul className="flex flex-col gap-[9px]">
              {pillar.items.map((item) => (
                <li
                  key={item}
                  className="relative pl-4 text-[0.92rem] text-ink-muted before:absolute before:top-[0.55em] before:left-0 before:h-[1.5px] before:w-1.5 before:bg-accent before:content-['']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
