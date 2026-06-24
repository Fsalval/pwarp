import { createClient } from '@supabase/supabase-js'

const url = String(import.meta.env.VITE_SUPABASE_URL ?? '')
const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '')

if (!url || !key) {
  throw new Error('Faltan variables de entorno de Supabase')
}

export const supabase = createClient(url, key)