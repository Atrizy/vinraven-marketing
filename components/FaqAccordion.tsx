'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Do I need to install anything or paste code on my site?',
    a: 'No. VinRaven is a white-glove service. We install and configure the chat widget on your website for you. You never touch code or scripts.',
  },
  {
    q: 'How long does setup take?',
    a: 'We typically have you live within a few days. You provide business info and approve wording; we handle all technical setup.',
  },
  {
    q: 'What happens when the AI doesn\'t know the answer?',
    a: 'When the AI can\'t provide a confident answer, it automatically creates a support ticket and collects the customer\'s email so you can follow up personally.',
  },
  {
    q: 'What will I actually use as a customer?',
    a: 'Two things: your website (where visitors chat) and your admin panel (where you read conversations, manage tickets, and see metrics). We handle everything else.',
  },
  {
    q: 'Is VinRaven a DIY chatbot builder?',
    a: 'No. VinRaven is a fully managed chat concierge. You don\'t build flows, train models, or configure integrations. We set everything up and maintain it for you.',
  },
  {
    q: 'Can I cancel or pause anytime?',
    a: 'No contracts. Cancel or pause anytime. We believe in earning your business every month.',
  },
]

export function FaqAccordion() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((item, i) => (
        <div
          key={i}
          className="glass-card rounded-xl overflow-hidden"
          onClick={() => setActive(active === i ? null : i)}
        >
          <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors">
            <span className="font-medium text-slate-100">{item.q}</span>
            <span
              className={`text-xl text-slate-400 transition-transform ${active === i ? 'rotate-45' : ''}`}
            >
              +
            </span>
          </div>
          {active === i && (
            <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
