import { supabase } from '../../lib/supabase'
import type { User } from '../../types/index'
import { sanitizeInput, validateUserData } from '../../lib/security'

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

// Login con email y contraseña
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  // ✅ Sanitizar email antes de enviar
  const sanitizedEmail = sanitizeInput(email)
  
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: sanitizedEmail, 
    password 
  })

  if (error) return { user: null, error: error.message }
  if (!data.user) return { user: null, error: 'No se pudo iniciar sesión' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', data.user.id)
    .single()

  return {
    user: { 
      id: data.user.id, 
      email: data.user.email ?? '',
      username: profile?.username 
    },
    error: null,
  }
}

// Registro con email, contraseña y username
export async function signUpWithEmail(
  email: string,
  password: string,
  username?: string
): Promise<{ user: User | null; error: string | null }> {
  
  // ✅ VALIDAR datos antes de enviar
  const validation = validateUserData({ email, username, password })
  if (!validation.valid) {
    return { user: null, error: validation.errors.join(', ') }
  }
  
  // ✅ SANITIZAR inputs
  const sanitizedEmail = sanitizeInput(email)
  const sanitizedUsername = username ? sanitizeInput(username) : undefined
  
  const { data, error } = await supabase.auth.signUp({ 
    email: sanitizedEmail, 
    password,
    options: {
      data: {
        username: sanitizedUsername || sanitizedEmail.split('@')[0]
      }
    }
  })

  if (error) return { user: null, error: error.message }
  if (!data.user) return { user: null, error: 'No se pudo crear la cuenta' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', data.user.id)
    .single()

  return {
    user: { 
      id: data.user.id, 
      email: data.user.email ?? '',
      username: profile?.username 
    },
    error: null,
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
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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