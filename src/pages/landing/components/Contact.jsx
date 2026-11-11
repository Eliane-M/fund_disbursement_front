import { useState } from 'react';
import Container from './Container.jsx';
import { contactDetails } from '../data/content.js';

const inputClass =
  'w-full rounded-md border border-line bg-bg px-3.5 py-3 font-sans text-[0.96rem] text-ink focus:outline-2 focus:outline-offset-1 focus:outline-accent';

function Field({ id, label, children }) {
  return (
    <div className="mb-[18px]">
      <label htmlFor={id} className="mb-[7px] block text-[0.85rem] text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mockup only: wire this up to a real inbox or form service for the live site.
    setSent(true);
  };

  return (
    <section id="contact" className="py-14 sm:py-[88px]">
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-2xl">Let's talk about your data</h2>
          <p className="mt-3.5 max-w-[42ch] text-ink-muted">
            Tell us what you're working on. Maybe your team needs training, a system needs building, or your strategy
            needs direction. We'll get back to you.
          </p>
          <div className="mt-[30px] flex flex-col gap-3.5">
            {contactDetails.map((detail) => (
              <div key={detail.label} className="text-[0.95rem]">
                <span className="mb-0.5 block text-[0.82rem] text-ink-faint">{detail.label}</span>
                {detail.value}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[10px] border border-line bg-elevated p-8">
          <Field id="name" label="Full name">
            <input id="name" type="text" placeholder="Your name" required className={inputClass} />
          </Field>
          <Field id="email" label="Email address">
            <input id="email" type="email" placeholder="you@company.com" required className={inputClass} />
          </Field>
          <Field id="org" label="Organization (optional)">
            <input id="org" type="text" placeholder="Company or organization" className={inputClass} />
          </Field>
          <Field id="message" label="What are you looking for?">
            <textarea
              id="message"
              placeholder="Tell us about your team, your data, or the program you're interested in"
              required
              className={`${inputClass} min-h-[100px] resize-y`}
            />
          </Field>
          <button type="submit" className="btn btn-primary mt-1.5 w-full justify-center">
            {sent ? 'Message sent' : 'Send message'}
          </button>
          <p className="mt-3.5 text-center text-[0.82rem] text-ink-faint">
            {sent
              ? "Thanks! This is a mockup form, so nothing was actually sent. We'll wire this up to a real inbox for the live site."
              : 'We usually reply within two working days.'}
          </p>
        </form>
      </Container>
    </section>
  );
}
