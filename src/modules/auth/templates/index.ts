import { supabase } from '../../../lib/supabase'
import type { Template } from '../../../types/index'

// ─── Caché local (offline-first) ─────────────────────────────────

const STORAGE_KEY = 'rpw_templates_cache'

function saveToCache(templates: Template[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

function loadFromCache(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Template[]) : []
  } catch {
    return []
  }
}

// ─── Operaciones ──────────────────────────────────────────────────

// Obtiene todas las plantillas del usuario.
// Si hay red: sincroniza con Supabase y actualiza el caché.
// Si no hay red: devuelve el caché local.
export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.warn('Sin conexión, usando caché local')
    return loadFromCache()
  }

  saveToCache(data)
  return data
}

// Crea una plantilla nueva
export async function createTemplate(
  input: Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ template: Template | null; error: string | null }> {
  const { data, error } = await supabase
    .from('templates')
    .insert(input)
    .select()
    .single()

  if (error || !data) {
    return { template: null, error: error?.message ?? 'Error al crear plantilla' }
  }

  // Actualiza caché local
  const cached = loadFromCache()
  saveToCache([data, ...cached])

  return { template: data, error: null }
}

// Elimina una plantilla por ID
export async function deleteTemplate(
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  // Actualiza caché local
  const cached = loadFromCache().filter(t => t.id !== id)
  saveToCache(cached)

  return { error: null }
}

// Actualiza el contenido de una plantilla
export async function updateTemplate(
  id: string,
  changes: Partial<Pick<Template, 'name' | 'content' | 'tags' | 'type'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('templates')
    .update(changes)
    .eq('id', id)

  if (error) return { error: error.message }

  // Actualiza caché local
  const cached = loadFromCache().map(t =>
    t.id === id ? { ...t, ...changes } : t
  )
  saveToCache(cached)

  return { error: null }
}