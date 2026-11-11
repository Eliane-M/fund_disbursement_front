import logoFullColor from '../assets/logo/logo-fullcolor.png';
import logoReversed from '../assets/logo/logo-reversed.png';

const alt = '3DP | Data Driven Decisions Partners';

// Shows the white/gold logo on the dark theme and the full-colour logo on the light theme.
export default function Logo({ className = 'h-14' }) {
  return (
    <a href="#home" className="inline-flex shrink-0 items-center">
      <img src={logoReversed} alt={alt} className={`logo-for-dark w-auto ${className}`} />
      <img src={logoFullColor} alt={alt} className={`logo-for-light w-auto ${className}`} />
    </a>
  );
}
