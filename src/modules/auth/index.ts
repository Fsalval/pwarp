import { supabase } from '../../lib/supabase'
import type { User } from '../../types/index'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

// Devuelve el usuario actual o null si no hay sesión
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()
  
  return { 
    id: user.id, 
    email: user.email ?? '',
    username: profile?.username 
  }
}

// Cerrar sesión
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

// Escucha cambios de sesión
export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
    if (!session?.user) {
      callback(null)
      return
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single()
    
    callback({ 
      id: session.user.id, 
      email: session.user.email ?? '',
      username: profile?.username 
    })
  })

  return () => subscription.unsubscribe()
}

// Login con Google
export async function signInWithGoogle(): Promise<{ url?: string; error?: string | null }> {
  try {
    const redirectTo = window.location.origin
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
    if (error) return { error: error.message }
    return { url: (data as any)?.url, error: null }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// Eliminar cuenta permanentemente
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No hay sesión activa' }
    }

    // 2. Eliminar el profile de la base de datos
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('[Delete Account] Error eliminando profile:', profileError)
    }

    // 3. Eliminar el usuario de auth (esto cerrará la sesión automáticamente)
    const { error: deleteError } = await supabase.rpc('delete_own_user')
    
    if (deleteError) {
      console.warn('[Delete Account] RPC no disponible, solo signOut:', deleteError)
      // Si la RPC no existe, solo cerramos sesión
      await supabase.auth.signOut()
    }

    // 4. Redirigir al home
    window.location.href = '/'
    
    return { success: true }
  } catch (err) {
    console.error('[Delete Account] Error:', err)
    return { success: false, error: (err as Error).message }
  }
}