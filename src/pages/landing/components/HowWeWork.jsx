import Section from './Section.jsx';
import { steps } from '../data/content.js';

export default function HowWeWork() {
  return (
    <Section
      id="how-we-work"
      title="How an engagement runs"
      intro="Whether we're running a program or building a system, the shape of the work stays the same."
    >
      <div className="grid grid-cols-1 gap-7 xs:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.title} className="border-t-2 border-accent pt-[18px]">
            <span className="mb-3.5 block font-display text-[1.6rem] text-ink-faint">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mb-2 text-[1.08rem]">{step.title}</h3>
            <p className="text-[0.94rem] text-ink-muted">{step.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
