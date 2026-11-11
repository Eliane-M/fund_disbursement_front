import Section from './Section.jsx';
import { programs } from '../data/content.js';

export default function Programs() {
  return (
    <Section
      id="programs"
      alt
      title="Capacity building programs"
      intro="Two tracks for two different starting points. One is for building a data career from scratch, the other for sharpening skills around a full-time job."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {programs.map((program) => (
          <div
            key={program.title}
            className="flex h-full flex-col rounded-[10px] border border-line bg-elevated p-9"
          >
            <span className="mb-5 inline-block self-start rounded-full border border-accent-2 px-[11px] py-[5px] text-[0.8rem] text-accent-2">
              {program.title}
            </span>
            <h3 className="mb-3 text-[1.4rem]">{program.title}</h3>
            <p className="text-[0.99rem] text-ink-muted">{program.text}</p>
            <ul className="mt-[22px] flex flex-wrap gap-2">
              {program.tracks.map((track) => (
                <li key={track} className="rounded-md bg-elevated-2 px-3 py-1.5 text-[0.85rem] text-ink">
                  {track}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between gap-4 pt-[26px]">
              <span className="text-[0.85rem] text-ink-faint">{program.format}</span>
              <a href="#contact" className="text-[0.92rem] font-semibold whitespace-nowrap text-accent no-underline">
                Ask about this program
              </a>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
