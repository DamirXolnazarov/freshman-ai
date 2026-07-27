import FreshmanCrest from '../ui/FreshmanCrest.jsx'
import Button from '../ui/Button.jsx'
import { signInWithGoogle } from '../../lib/auth.js'

export default function LandingNav({ onSignIn, onGetStarted }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-navy-900/[0.06] bg-parchment-50/85 px-8 py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <FreshmanCrest size={30} />
        <div className="leading-tight">
          <p className="font-serif text-[16px] text-navy-900">Freshman</p>
          <p className="text-[9.5px] tracking-[0.18em] text-gold-600 uppercase">Academy</p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-[13.5px] text-ink-700">
        <a href="#product" className="hover:text-navy-900">Product</a>
        <a href="#loop" className="hover:text-navy-900">How it works</a>
        <a href="#features" className="hover:text-navy-900">Features</a>
      </nav>

      <div className="flex items-center gap-2.5">
        <Button variant="ghost" size="sm" onClick={signInWithGoogle}>Sign in</Button>
        <Button variant="primary" size="sm" onClick={signInWithGoogle}>Start your journey</Button>
      </div>
    </header>
  )
}
