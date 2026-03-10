'use server'

import { supabase } from '@/lib/supabase'

export type SubmitLeadState = { ok: boolean; error?: string }

export async function submitLead(
  _prevState: SubmitLeadState,
  formData: FormData
): Promise<SubmitLeadState> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const businessName = (formData.get('business_name') as string)?.trim()
  const message = (formData.get('message') as string)?.trim()

  if (!name || name.length < 2) {
    return { ok: false, error: 'Please enter your full name.' }
  }
  if (!email) {
    return { ok: false, error: 'Please enter your business email.' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (!businessName || businessName.length < 2) {
    return { ok: false, error: 'Please enter your business name.' }
  }
  if (!message || message.length < 10) {
    return { ok: false, error: 'Please tell us how we can help (at least 10 characters).' }
  }

  if (!supabase) {
    return { ok: false, error: 'Lead capture is not configured. Please email us directly at support@vinraven.com.' }
  }

  const { error } = await supabase.from('leads').insert({
    name,
    email,
    business_name: businessName,
    message,
  })

  if (error) {
    return { ok: false, error: 'Something went wrong. Please try again or email us directly.' }
  }

  return { ok: true }
}
