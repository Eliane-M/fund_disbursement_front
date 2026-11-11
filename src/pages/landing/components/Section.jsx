import Container from './Container.jsx';

export default function Section({ id, alt = false, title, intro, children }) {
  return (
    <section id={id} className={`py-14 sm:py-[88px] ${alt ? 'bg-elevated' : ''}`}>
      <Container>
        {title && (
          <div className="mb-12 max-w-[640px]">
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)]">{title}</h2>
            {intro && <p className="mt-3.5 max-w-[56ch] text-[1.03rem] text-ink-muted">{intro}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
