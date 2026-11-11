import App from './App.jsx'
import './landing.css'

// Public marketing page (the 3DP website). Everything is scoped under
// `.landing-root` so none of its styles leak into the console app.
export function LandingPage() {
  return (
    <div className="landing-root">
      <App />
    </div>
  )
}
