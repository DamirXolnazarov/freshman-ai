import LandingNav from '../components/landing/LandingNav.jsx'
import LandingHero from '../components/landing/LandingHero.jsx'
import LandingPositioning from '../components/landing/LandingPositioning.jsx'
import LandingCoreLoop from '../components/landing/LandingCoreLoop.jsx'
import LandingFeatures from '../components/landing/LandingFeatures.jsx'
import LandingClosing from '../components/landing/LandingClosing.jsx'
import { signInWithGoogle } from '../lib/auth.js'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment-50">
      <LandingNav onSignIn={signInWithGoogle} onGetStarted={signInWithGoogle} />
      <LandingHero onGetStarted={signInWithGoogle} />
      <LandingPositioning />
      <LandingCoreLoop />
      <LandingFeatures />
      <LandingClosing onGetStarted={signInWithGoogle} />
    </div>
  )
}