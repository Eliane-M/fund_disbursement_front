import { Link } from 'react-router-dom';
import Container from './Container.jsx';
import { heroStrap } from '../data/content.js';

const points = [
  { cx: 40, cy: 300, delay: 0.3 },
  { cx: 120, cy: 210, delay: 0.6 },
  { cx: 190, cy: 260, delay: 0.85 },
  { cx: 260, cy: 120, delay: 1.1 },
  { cx: 340, cy: 170, delay: 1.35 },
];

function HeroGraphic() {
  return (
    <svg
      className="hero-graphic h-auto w-full"
      viewBox="0 0 480 380"
      fill="none"
      role="img"
      aria-label="Illustration of scattered data points connecting into a single decision point"
    >
      <g className="stroke-line" strokeWidth="1">
        {[60, 150, 240, 330].map((y) => (
          <line key={y} x1="0" y1={y} x2="480" y2={y} />
        ))}
      </g>
      <path
        className="draw stroke-accent-2"
        d="M40 300 L120 210 L190 260 L260 120 L340 170 L420 70"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="draw stroke-accent"
        d="M420 70 C 440 100, 445 140, 428 175"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ animationDelay: '1.6s' }}
      />
      {points.map((p) => (
        <circle
          key={p.cx}
          className="node fill-ink-faint"
          cx={p.cx}
          cy={p.cy}
          r="6"
          style={{ animationDelay: `${p.delay}s` }}
        />
      ))}
      <circle className="node fill-accent-2" cx="420" cy="70" r="7" style={{ animationDelay: '1.55s' }} />
      <circle className="node fill-accent" cx="428" cy="175" r="10" style={{ animationDelay: '2.2s' }} />
      <text
        className="node fill-ink-muted font-sans"
        x="428"
        y="200"
        textAnchor="middle"
        fontSize="12"
        style={{ animationDelay: '2.3s' }}
      >
        Decision
      </text>
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="home" className="hero-dots relative overflow-hidden pt-14 pb-12 lg:pt-24 lg:pb-20">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-[0.95rem] text-ink-faint">
            Based in Kigali, working with companies and individuals across East Africa.
          </p>
          <h1 className="max-w-[15ch] text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.09]">
            Every decision your business makes is already sitting inside your data.
          </h1>
          <p className="mt-[22px] max-w-[46ch] text-[1.08rem] text-ink-muted">
            3DP helps companies and individuals become data driven through training, data products, data-driven
            systems, and strategy, so decisions stop relying on guesswork.
          </p>
          <div className="mt-[34px] flex flex-wrap gap-3.5">
            <a href="#what-we-do" className="btn btn-primary">
              See what we do
            </a>
            <a href="#programs" className="btn btn-ghost">
              Join a program
            </a>
            <Link to="/login" className="btn btn-ghost">
              Sign in
            </Link>
          </div>
          <div className="mt-14 flex flex-wrap gap-3.5 border-t border-line pt-[26px] text-[0.92rem] text-ink-faint">
            {heroStrap.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <HeroGraphic />
      </Container>
    </section>
  );
}
