import { useEffect, useRef, useState } from 'react'
import './index.css'

// ═══════════════════════════════════════════════════════════════
// ICON COMPONENTS
// ═══════════════════════════════════════════════════════════════

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const GitBranchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

// ═══════════════════════════════════════════════════════════════
// LOGO COMPONENT
// ═══════════════════════════════════════════════════════════════

const Logo = () => (
  <div className="logo-icon">
    <svg viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00FF9D" />
        </linearGradient>
      </defs>
      <path
        d="M20 4L6 12V28L20 36L34 28V12L20 4Z"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M20 10L12 14V22L20 26L28 22V14L20 10Z"
        fill="url(#logoGradient)"
      />
      <circle cx="20" cy="18" r="3" fill="#0A0A0F" />
    </svg>
  </div>
)

// ═══════════════════════════════════════════════════════════════
// NAVIGATION COMPONENT
// ═══════════════════════════════════════════════════════════════

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#" className="logo">
          <Logo />
          <span className="logo-text">Sentinel AI</span>
        </a>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#solutions" className="nav-link">Solutions</a>
          <a href="#trust" className="nav-link">Trust</a>
          <a href="#" className="nav-link">Docs</a>
          <a href="#cta" className="nav-cta">Get Started</a>
        </div>
        <button className="nav-menu-btn">
          <MenuIcon />
        </button>
      </div>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Now protecting 10M+ AI interactions daily
        </div>
        <h1 className="hero-title">
          Secure Your AI
          <br />
          <span className="hero-title-accent">Before It Secures You</span>
        </h1>
        <p className="hero-subtitle">
          Enterprise-grade security infrastructure for AI systems. Detect vulnerabilities,
          prevent attacks, and maintain compliance across all your AI deployments in real-time.
        </p>
        <div className="hero-cta-group">
          <a href="#cta" className="btn btn-primary">
            <span>Start Free Trial</span>
            <ChevronRightIcon />
          </a>
          <a href="#solutions" className="btn btn-secondary">
            <span>View Solutions</span>
          </a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">99.9%</div>
            <div className="hero-stat-label">Threat Detection</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">&lt;50ms</div>
            <div className="hero-stat-label">Response Time</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">500+</div>
            <div className="hero-stat-label">Enterprise Clients</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// FEATURES SECTION
// ═══════════════════════════════════════════════════════════════

const features = [
  {
    icon: <ShieldIcon />,
    title: 'AI Firewall',
    description: 'Real-time protection against prompt injection, data exfiltration, and model manipulation attacks.',
  },
  {
    icon: <BrainIcon />,
    title: 'Adaptive Learning',
    description: 'Self-evolving threat detection that learns from new attack vectors and adapts to your specific AI models.',
  },
  {
    icon: <EyeIcon />,
    title: 'Full Visibility',
    description: 'Complete audit trails and monitoring for every AI interaction, input, and output across your infrastructure.',
  },
  {
    icon: <LockIcon />,
    title: 'Data Governance',
    description: 'Granular controls for data access, retention, and compliance with GDPR, HIPAA, and SOC 2 requirements.',
  },
  {
    icon: <ZapIcon />,
    title: 'Zero Latency',
    description: 'Security layer adds sub-millisecond overhead, ensuring AI performance is never compromised.',
  },
  {
    icon: <GitBranchIcon />,
    title: 'CI/CD Integration',
    description: 'Automated security testing and validation in your ML pipelines with GitHub, GitLab, and Jenkins support.',
  },
]

const Features = () => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = sectionRef.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="features" ref={sectionRef}>
      <div className="section-header reveal">
        <span className="section-label">Features</span>
        <h2 className="section-title">Built for AI-Native Security</h2>
        <p className="section-subtitle">
          Comprehensive protection designed specifically for the unique challenges of AI and ML systems.
        </p>
      </div>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card reveal"
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// SOLUTIONS SECTION
// ═══════════════════════════════════════════════════════════════

const solutions = [
  {
    title: 'Detect & Respond',
    description: 'Identify threats in real-time with AI-powered analysis and automated incident response.',
  },
  {
    title: 'Model Security',
    description: 'Protect your ML models from adversarial attacks, data poisoning, and model theft.',
  },
  {
    title: 'Compliance Automation',
    description: 'Automate compliance reporting and maintain continuous audit readiness.',
  },
  {
    title: 'Secure Deployment',
    description: 'Safe deployment pipelines with built-in security validation and rollback capabilities.',
  },
]

const Solutions = () => {
  return (
    <section id="solutions" className="solutions">
      <div className="solutions-container">
        <div className="solutions-grid">
          <div className="solutions-visual">
            <div className="orbital-ring"></div>
            <div className="orbital-ring"></div>
            <div className="orbital-ring"></div>
            <div className="orbital-center">
              <ShieldIcon />
            </div>
            <div className="orbital-dot"></div>
            <div className="orbital-dot"></div>
            <div className="orbital-dot"></div>
            <div className="orbital-dot"></div>
          </div>
          <div className="solutions-content">
            <h2>End-to-End AI Security Pipeline</h2>
            <p>
              From development to deployment, our security solutions cover every stage
              of your AI lifecycle with intelligent, adaptive protection.
            </p>
            <div className="solution-list">
              {solutions.map((solution, index) => (
                <div key={index} className="solution-item">
                  <div className="solution-item-number">{index + 1}</div>
                  <div className="solution-item-content">
                    <h4>{solution.title}</h4>
                    <p>{solution.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// TRUST SECTION
// ═══════════════════════════════════════════════════════════════

const trustLogos = [
  'TechCorp',
  'FinanceHub',
  'HealthAI',
  'DataSys',
  'CloudScale',
  'SecureNet',
]

const testimonials = [
  {
    text: 'Sentinel AI detected a sophisticated prompt injection attack that our previous tools completely missed. Their adaptive learning is next-level.',
    author: 'Sarah Chen',
    role: 'CISO at TechCorp',
    initial: 'SC',
  },
  {
    text: 'We reduced our AI security incident response time from hours to seconds. The ROI has been incredible for our ML engineering team.',
    author: 'Marcus Rodriguez',
    role: 'VP Engineering at FinanceHub',
    initial: 'MR',
  },
  {
    text: 'Compliance was our biggest concern with AI deployment. Sentinel made SOC 2 and HIPAA certification straightforward.',
    author: 'Dr. Emily Watson',
    role: 'CTO at HealthAI',
    initial: 'EW',
  },
]

const Trust = () => {
  return (
    <section id="trust" className="trust">
      <div className="section-header">
        <span className="section-label">Trusted By</span>
        <h2 className="section-title">Industry Leaders Choose Sentinel</h2>
      </div>
      <div className="trust-logos">
        {trustLogos.map((logo, index) => (
          <div key={index} className="trust-logo">{logo}</div>
        ))}
      </div>
      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <p className="testimonial-text">{testimonial.text}</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{testimonial.initial}</div>
              <div className="testimonial-info">
                <h5>{testimonial.author}</h5>
                <p>{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════════════════════

const CTA = () => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    console.log('Email submitted:', email)
    setEmail('')
  }

  return (
    <section id="cta" className="cta">
      <div className="cta-container">
        <div className="cta-content">
          <h2>Ready to Secure Your AI Infrastructure?</h2>
          <p>
            Start your free 14-day trial today. No credit card required.
            Get full access to all features and our dedicated support team.
          </p>
          <form className="cta-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="cta-input"
              placeholder="Enter your work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              <span>Get Started</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// FOOTER COMPONENT
// ═══════════════════════════════════════════════════════════════

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-copy">
          © 2024 Sentinel AI. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Security</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════

function App() {
  return (
    <>
      <div className="grid-bg"></div>
      <div className="scanlines"></div>
      <Navigation />
      <main>
        <Hero />
        <Features />
        <Solutions />
        <Trust />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

export default App