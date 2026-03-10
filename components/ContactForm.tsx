'use client'

import { useActionState } from 'react'
import { submitLead } from '@/app/actions/leads'

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitLead, { ok: false })

  if (state.ok) {
    return (
      <div className="text-center py-8">
        <p className="text-xl font-semibold text-slate-100 mb-2">
          Thanks! We&apos;ll be in touch shortly to set up your custom demo.
        </p>
        <p className="text-slate-400 text-sm">
          Check your inbox for our response.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="max-w-md mx-auto space-y-4">
      {state.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-[#8b5cf6] focus:outline-none focus:ring-0"
          placeholder="Jane Smith"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
          Business Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-[#8b5cf6] focus:outline-none focus:ring-0"
          placeholder="jane@yourbusiness.com"
        />
      </div>
      <div>
        <label htmlFor="business_name" className="block text-sm font-medium text-slate-300 mb-1">
          Business Name
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          required
          className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-[#8b5cf6] focus:outline-none focus:ring-0"
          placeholder="Acme Auto Shop"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-[#8b5cf6] focus:outline-none focus:ring-0 resize-none"
          placeholder="Tell us about your business and what you need..."
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#8b5cf6] text-white font-bold py-3.5 hover:bg-[#9d6ff7] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? 'Sending...' : 'Get Your Custom Demo'}
      </button>
    </form>
  )
}
