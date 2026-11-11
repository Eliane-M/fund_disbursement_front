import Section from './Section.jsx';
import { audiences } from '../data/content.js';

const icons = {
  startups: <path d="M5 19L19 5M9 5h10v10" />,
  smes: <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />,
  enterprises: <path d="M3 21h18M4 21V5h8v16M12 21V9h8v12M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2" />,
};

export default function WhoWeServe() {
  return (
    <Section
      id="who-we-serve"
      alt
      title="Who we serve"
      intro="Whatever the size of your business, the goal is the same: better decisions from the data you already have."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {audiences.map((audience) => (
          <div key={audience.title} className="flex flex-col rounded-[10px] border border-line bg-bg p-8">
            <svg
              className="mb-5 h-[38px] w-[38px] text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {icons[audience.icon]}
            </svg>
            <h3 className="mb-2.5 text-[1.3rem]">{audience.title}</h3>
            <p className="mb-[18px] text-[0.98rem] text-ink-muted">{audience.text}</p>
            <ul className="mt-auto flex flex-col gap-[9px] border-t border-line pt-[18px]">
              {audience.items.map((item) => (
                <li
                  key={item}
                  className="relative pl-4 text-[0.92rem] text-ink-muted before:absolute before:top-[0.55em] before:left-0 before:h-[1.5px] before:w-1.5 before:bg-accent-2 before:content-['']"
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
