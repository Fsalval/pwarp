import { createClient } from '@supabase/supabase-js'

const url = String(import.meta.env.VITE_SUPABASE_URL ?? '')
const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '')

if (!url || !key) {
  const missing = [
    !import.meta.env.VITE_SUPABASE_URL ? 'VITE_SUPABASE_URL' : null,
    !import.meta.env.VITE_SUPABASE_ANON_KEY ? 'VITE_SUPABASE_ANON_KEY' : null,
  ].filter(Boolean)

  throw new Error(
    `Faltan variables de entorno de Supabase: ${missing.join(', ')}. ` +
      `Asegúrate de que exista un archivo .env con esas claves y que Vite las cargue.`
  )
}

export const supabase = createClient(url, key)

