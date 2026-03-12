import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { FaqAccordion } from '@/components/FaqAccordion'
import { ContactForm } from '@/components/ContactForm'

export default function HomePage() {
  return (
    <>
      <div className="gradient-bg">
        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-lg border-b border-slate-800/60">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="#" className="flex items-center gap-2 font-bold text-lg text-slate-100">
              <Image src="/vinraven.png" alt="VinRaven" width={32} height={32} className="rounded-lg" />
              VinRaven
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <a href="#problem" className="text-slate-400 hover:text-slate-100 transition-colors">
                Why VinRaven
              </a>
              <a href="#process" className="text-slate-400 hover:text-slate-100 transition-colors">
                How it works
              </a>
              <a href="#pricing" className="text-slate-400 hover:text-slate-100 transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-slate-400 hover:text-slate-100 transition-colors">
                FAQ
              </a>
              <a href="#contact" className="text-slate-400 hover:text-slate-100 transition-colors">
                Contact
              </a>
            </nav>
            <Link
              href="#contact"
              className="px-5 py-2.5 rounded-lg bg-[#8b5cf6] text-white font-semibold text-sm hover:bg-[#9d6ff7] transition-colors"
            >
              Get Your Custom Demo
            </Link>
          </div>
        </header>

        <main className="pt-20">
          {/* Hero */}
          <section className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="badge bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/40 mb-4">
                  Done-for-you AI front desk
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-5">
                  Your Digital Front Desk. Awake 24/7.
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
                  VinRaven answers your customers&apos; questions instantly and captures every inquiry as a ticket. Never miss a lead again, even when you&apos;re off the clock.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="#contact"
                    className="px-6 py-3.5 rounded-xl bg-[#8b5cf6] text-white font-bold text-base hover:bg-[#9d6ff7] transition-colors"
                  >
                    Start Capturing Leads
                  </Link>
                  <Link
                    href="#process"
                    className="px-6 py-3.5 rounded-xl border border-slate-600 text-slate-200 font-semibold hover:bg-white/5 transition-colors"
                  >
                    See how it works
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="glass-card rounded-2xl p-6 shadow-2xl">
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="bg-slate-800/80 rounded-2xl rounded-bl-md px-4 py-2 text-sm max-w-[80%]">
                        Hi, I&apos;m your front desk. How can I help today?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#8b5cf6] rounded-2xl rounded-br-md px-4 py-2 text-sm max-w-[80%]">
                        What are your hours this week?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-slate-800/80 rounded-2xl rounded-bl-md px-4 py-2 text-sm max-w-[80%]">
                        We&apos;re open Mon–Fri 9–6, Sat 10–4. Want to book an appointment?
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="flex-1 h-10 rounded-lg bg-slate-800/60" />
                    <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/80" />
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 glass-card rounded-xl p-4 w-40 opacity-90">
                  <div className="text-xs text-slate-400 mb-1">One-click replies</div>
                  <div className="h-2 bg-slate-600 rounded mb-2" />
                  <div className="h-2 bg-slate-600 rounded mb-2 w-3/4" />
                  <div className="h-2 bg-[#8b5cf6]/40 rounded w-1/2" />
                </div>
              </div>
            </div>
          </section>

          {/* Problem / Solution */}
          <section id="problem" className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center mb-4">
              Answering the same questions shouldn&apos;t be a 24/7 job.
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-slate-100 text-lg mb-3">Never Miss a Lead</h3>
                <p className="text-slate-400 leading-relaxed">
                  Most customers won&apos;t leave a voicemail; they&apos;ll just call the next business on Google. VinRaven captures them instantly.
                </p>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-slate-100 text-lg mb-3">Kill the Repetitive Calls</h3>
                <p className="text-slate-400 leading-relaxed">
                  Stop spending your day answering &quot;Are you open?&quot; and &quot;What do you charge?&quot; Let the AI handle the basics.
                </p>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-slate-100 text-lg mb-3">The Human Handoff</h3>
                <p className="text-slate-400 leading-relaxed">
                  When a customer needs a real person, VinRaven captures their email and opens a ticket. You reply via email when you&apos;re ready.
                </p>
              </div>
            </div>
          </section>

          {/* White-Glove Process */}
          <section id="process" className="border-y border-slate-800/60 bg-slate-950/40 py-20">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center mb-4">
                The White-Glove Process
              </h2>
              <p className="section-subtitle text-center mx-auto mb-16">
                No code. No setup. We do the work.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#8b5cf6]/20 border-2 border-[#8b5cf6]/40 flex items-center justify-center text-[#8b5cf6] font-bold text-xl mx-auto mb-4">
                    1
                  </div>
                  <h3 className="font-bold text-slate-100 text-lg mb-3">The Knowledge Dump</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Send us your menu, pricing, and FAQs. We spend the hours training the AI so you don&apos;t have to.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#8b5cf6]/20 border-2 border-[#8b5cf6]/40 flex items-center justify-center text-[#8b5cf6] font-bold text-xl mx-auto mb-4">
                    2
                  </div>
                  <h3 className="font-bold text-slate-100 text-lg mb-3">The Silent Setup</h3>
                  <p className="text-slate-400 leading-relaxed">
                    We install the widget on your site. It starts answering questions and qualifying leads the moment it goes live.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#8b5cf6]/20 border-2 border-[#8b5cf6]/40 flex items-center justify-center text-[#8b5cf6] font-bold text-xl mx-auto mb-4">
                    3
                  </div>
                  <h3 className="font-bold text-slate-100 text-lg mb-3">One-Click Replies</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Your dashboard shows every conversation. See a lead you like? Click one button to reply directly to their inbox.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4 Service Tiers */}
          <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center mb-4">
              Choose Your Plan
            </h2>
            <p className="section-subtitle text-center mx-auto mb-16">
              Done-for-you setup. Custom training included.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'The Digital Receptionist', price: '$99', period: '/mo', ideal: 'Ideal for one-man shops needing a 24/7 safety net.', features: ['Full custom training', '24/7 lead capture', 'Standard admin dashboard'] },
                { name: 'The Lead Generator', price: '$199', period: '/mo', ideal: 'Built for busy local shops with steady daily questions.', features: ['Faster AI response logic', 'Priority ticket notifications', 'Monthly knowledge updates'], featured: true },
                { name: 'The Digital Front Door', price: '$299', period: '/mo', ideal: 'For professional clinics and high-volume services.', features: ['Advanced multi-page training', 'Dedicated lead qualification', 'Bi-weekly performance reviews'] },
                { name: 'The Regional Partner', price: '$499+', period: '/mo', ideal: 'Custom solutions for multi-location brands and franchises.', features: ['Multi-site management', 'Custom branding', 'Dedicated account manager'] },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`flex h-full flex-col glass-card rounded-2xl p-6 ${
                    (p as { featured?: boolean }).featured ? 'ring-1 ring-[#8b5cf6]' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-100">{p.name}</h3>
                      {(p as { featured?: boolean }).featured && (
                        <span className="badge shrink-0 bg-[#8b5cf6]/20 text-[#8b5cf6] text-[10px]">Popular</span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-slate-100 mb-1">
                      {p.price}
                      <span className="text-sm font-normal text-slate-400">{p.period}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{p.ideal}</p>
                    <ul className="space-y-2 text-sm text-slate-400">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-[#8b5cf6] font-bold">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto pt-6">
                    <Link
                      href="#contact"
                      className={`block w-full rounded-xl py-3 text-center font-semibold text-sm transition-colors ${
                        (p as { featured?: boolean }).featured
                          ? 'bg-[#8b5cf6] text-white hover:bg-[#9d6ff7]'
                          : 'border border-slate-600 text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      Get Your Custom Demo
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-500 text-sm mt-8">
              Custom setup and training fee applies to all new accounts. Contact for a quote.
            </p>
          </section>

          {/* Local Credibility */}
          <section className="border-y border-slate-800/60 bg-slate-950/40 py-12">
            <div className="max-w-6xl mx-auto px-6 text-center">
              <p className="text-slate-400 font-medium">
                Proudly serving Corner Brook and Atlantic Canada. Real support from a local team.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="max-w-2xl mx-auto px-6 py-20">
            <h2 className="text-2xl font-bold text-slate-100 text-center mb-4">FAQ</h2>
            <p className="section-subtitle text-center mx-auto mb-12">
              Quick answers to common questions.
            </p>
            <FaqAccordion />
          </section>

          {/* Contact Us */}
          <section id="contact" className="max-w-6xl mx-auto px-6 py-20">
            <div className="glass-card rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-100 text-center mb-2">Contact Us</h2>
              <p className="text-slate-400 text-center mb-8">Get your custom demo. We&apos;ll be in touch shortly.</p>
              <ContactForm />
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-slate-800/60 py-16">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-800/60">
                <Link href="#" className="flex items-center gap-2 font-bold text-slate-100">
                  <Image src="/vinraven.png" alt="VinRaven" width={28} height={28} className="rounded-lg" />
                  VinRaven
                </Link>
                <nav className="flex flex-wrap justify-center gap-6 text-sm">
                  <a href="#pricing" className="text-slate-500 hover:text-slate-300">Pricing</a>
                  <a href="#process" className="text-slate-500 hover:text-slate-300">How it works</a>
                  <a href="mailto:support@vinraven.com" className="text-slate-500 hover:text-slate-300">Contact</a>
                  <a href="/privacy" className="text-slate-500 hover:text-slate-300">Privacy</a>
                  <a href="/terms" className="text-slate-500 hover:text-slate-300">Terms</a>
                </nav>
              </div>
              <p className="text-center text-slate-600 text-sm mt-8">© 2026 VinRaven. All rights reserved.</p>
            </div>
          </footer>
        </main>
      </div>

      {/* Bubble above chat widget */}
      <div
        className="fixed bottom-[100px] right-6 z-[999998] rounded-xl bg-[#8b5cf6] px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        style={{ boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)' }}
      >
        Try me here!
      </div>

      <Script
        src="/vinraven-widget.js"
        strategy="afterInteractive"
        data-api-url={process.env.NEXT_PUBLIC_VINRAVEN_API_URL ?? 'http://localhost:8000'}
        data-api-key={process.env.NEXT_PUBLIC_VINRAVEN_API_KEY ?? 'REPLACE_ME_DEV_KEY'}
        data-client-id="vinraven"
        data-color="#8b5cf6"
      />
    </>
  )
}
