// ─── LegalModal.ts ───────────────────────────────────────────────────────────
// Muestra el modal de Términos y Política al primer login con Google.
// Uso:
//   import { initLegalModal } from './LegalModal'
//   initLegalModal(supabase)          ← llámalo UNA vez al arrancar la app

import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Comprueba si el usuario ya tiene fila en `profiles`.
 * Devuelve true si es usuario nuevo (no existe en profiles).
 */
async function shouldShowModal(client: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await client
    .from('profiles')
    .select('accepted_terms')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[LegalModal] Error al consultar profiles:', error.message)
    return true
  }

  return data === null || data.accepted_terms !== true
}

/**
 * Crea la fila en `profiles` con los datos del usuario de Google.
 */
async function acceptTermsAndCreateProfile(
  client: SupabaseClient, 
  userId: string, 
  email: string, 
  username: string
): Promise<void> {
  const { data: existing } = await client
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (existing) {
    const { error } = await client
      .from('profiles')
      .update({ accepted_terms: true })
      .eq('id', userId)

    if (error) throw error
  } else {
    const { error } = await client
      .from('profiles')
      .insert({
        id: userId,
        email,
        username,
        accepted_terms: true,
      })

    if (error) throw error
  }
}

/**
 * Borra al usuario de auth.users usando una RPC que debe existir en Supabase.
 * Ver archivo: delete_own_user.sql (instrucciones abajo).
 * Si no tienes la RPC, solo hace signOut (el registro queda huérfano pero
 * sin profile no puede usar nada — puedes limpiarlo con un cron).
 */
async function deleteAndSignOut(client: SupabaseClient): Promise<void> {
  // Intentamos borrar vía RPC (requiere función SQL en tu Supabase)
  const { error } = await client.rpc('delete_own_user')

  if (error) {
    // La RPC no existe o falló → solo cerramos sesión.
    // El usuario queda en auth.users sin profile, inofensivo.
    console.warn('[LegalModal] RPC delete_own_user no disponible, solo signOut:', error.message)
  }

  await client.auth.signOut()
}

// ─── HTML del modal ───────────────────────────────────────────────────────────

function buildModalHTML(): string {
  return `
    <div id="legal-modal" class="legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title">
      <div class="legal-modal-overlay"></div>
      <div class="legal-modal-box">

        <h2 id="legal-modal-title" class="legal-modal-title">Antes de continuar</h2>
        <p class="legal-modal-subtitle">Para crear tu cuenta necesitamos que leas y aceptes lo siguiente:</p>

        <div class="legal-modal-tabs">
          <button class="legal-tab-btn active" data-tab="privacidad">Política de Privacidad</button>
          <button class="legal-tab-btn" data-tab="terminos">Términos de Uso</button>
        </div>

        <!-- Política de Privacidad -->
        <div class="legal-tab-panel active" id="legal-panel-privacidad">
          <div class="legal-scroll">
            <h3>Política de Privacidad</h3>
            <p>Para usar las funciones de guardado, utilizamos la autenticación de Google. Al registrarte por primera vez, recopilamos y tratamos tus datos bajo las siguientes condiciones:</p>
            <ul>
              <li><strong>Datos que recopilamos:</strong> Tu nombre, correo electrónico e identificador único (ID) proporcionados de forma segura por Google. No tenemos acceso a tu contraseña de Google.</li>
              <li><strong>Finalidad del tratamiento:</strong> Usamos tus datos única y exclusivamente para crear tu cuenta y permitirte guardar tus borradores, textos decorados y símbolos favoritos. No realizamos perfiles comerciales ni enviaremos correos masivos de publicidad.</li>
              <li><strong>Terceros:</strong> No vendemos, cedemos ni compartimos tus datos con ninguna empresa o persona externa.</li>
              <li><strong>Tus Derechos:</strong> Tus datos te pertenecen. En cumplimiento con las normativas de protección de datos (incluyendo la ley chilena N° 21.719 y la ley mexicana LFPDPPP), tienes derecho a eliminar tu cuenta en cualquier momento. Al presionar "Eliminar Cuenta" en tu perfil, tu usuario, correo y todos tus borradores guardados se borrarán de forma inmediata y permanente de nuestros servidores.</li>
            </ul>
          </div>
        </div>

        <!-- Términos y Condiciones -->
        <div class="legal-tab-panel" id="legal-panel-terminos">
          <div class="legal-scroll">
            <h3>Términos y Condiciones de Uso</h3>
            <p>Bienvenido a nuestra herramienta gratuita de conteo y decoración de texto. Al registrarte y utilizar nuestra plataforma, aceptas las siguientes reglas:</p>
            <ul>
              <li><strong>Gratuidad y Servicio:</strong> Este es un sitio web utilitario de acceso gratuito. El servicio se ofrece "tal cual". No nos hacemos responsables por pérdidas de información, caídas del servidor o fallas técnicas que eliminen tus borradores guardados.</li>
              <li><strong>Uso Correcto:</strong> Te comprometes a usar la herramienta de forma legítima. Queda estrictamente prohibido utilizar nuestros servidores para almacenar textos que promuevan actividades ilegales, discursos de odio o contenido que infrinja derechos de autor.</li>
              <li><strong>Modificaciones:</strong> Nos reservamos el derecho de actualizar el diseño, las funciones o estos términos en el futuro. Si realizamos cambios importantes en el manejo de datos, te lo notificaremos al iniciar sesión.</li>
            </ul>
          </div>
        </div>

        <!-- Acciones -->
        <div class="legal-modal-actions">
          <button type="button" class="legal-btn-accept" id="legal-btn-accept">
            Acepto los términos y crear mi cuenta
          </button>
          <button type="button" class="legal-btn-reject" id="legal-btn-reject">
            No acepto, salir
          </button>
        </div>

        <p id="legal-modal-error" class="legal-modal-error hidden"></p>

      </div>
    </div>
  `
}

// ─── Lógica principal ─────────────────────────────────────────────────────────

function mountModal(): void {
  if (document.getElementById('legal-modal')) return // ya montado
  const wrapper = document.createElement('div')
  wrapper.innerHTML = buildModalHTML()
  document.body.appendChild(wrapper.firstElementChild!)
}

function showModal(): void {
  const modal = document.getElementById('legal-modal')
  modal?.classList.add('visible')
  document.body.style.overflow = 'hidden'
}

function hideModal(): void {
  const modal = document.getElementById('legal-modal')
  modal?.classList.remove('visible')
  document.body.style.overflow = ''
}

function bindModalTabs(): void {
  document.querySelectorAll<HTMLButtonElement>('.legal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset['tab']!

      document.querySelectorAll('.legal-tab-btn').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.legal-tab-panel').forEach(p => p.classList.remove('active'))

      btn.classList.add('active')
      document.getElementById(`legal-panel-${tab}`)?.classList.add('active')
    })
  })
}

function setLoading(loading: boolean): void {
  const acceptBtn = document.getElementById('legal-btn-accept') as HTMLButtonElement
  const rejectBtn = document.getElementById('legal-btn-reject') as HTMLButtonElement

  if (loading) {
    acceptBtn.textContent = 'Creando cuenta...'
    acceptBtn.setAttribute('disabled', '')
    rejectBtn.setAttribute('disabled', '')
  } else {
    acceptBtn.textContent = 'Acepto los términos y crear mi cuenta'
    acceptBtn.removeAttribute('disabled')
    rejectBtn.removeAttribute('disabled')
  }
}

function showError(msg: string): void {
  const el = document.getElementById('legal-modal-error')
  if (!el) return
  el.textContent = msg
  el.classList.remove('hidden')
}

// ─── Entry point ──────────────────────────────────────────────────────────────

/**
 * Inicializa el sistema del modal legal.
 * Llámalo una vez al arrancar la app, pasándole tu cliente de Supabase.
 *
 * @example
 *   import { createClient } from '@supabase/supabase-js'
 *   import { initLegalModal } from './LegalModal'
 *
 *   const supabase = createClient(URL, ANON_KEY)
 *   initLegalModal(supabase)
 */
export function initLegalModal(client: SupabaseClient): void {
  mountModal()
  bindModalTabs()

  client.auth.onAuthStateChange(async (event, session) => {
    // Solo nos interesa cuando acaba de entrar un usuario
    if (event !== 'SIGNED_IN' || !session?.user) return

    const user = session.user
    const userId = user.id
    const email = user.email ?? ''
    const username =
      user.user_metadata?.['full_name'] ??
      user.user_metadata?.['name'] ??
      email.split('@')[0] ??
      'usuario'

    const show = await isNewUser(client, userId)

    if (!show) {
      // Usuario existente → entra directo, sin modal
      hideModal()
      return
    }

    // Usuario nuevo → mostramos el modal
    showModal()

    // ── Botón Aceptar ────────────────────────────────────────────
    const acceptBtn = document.getElementById('legal-btn-accept')!
    const rejectBtn = document.getElementById('legal-btn-reject')!

    // Clonamos para evitar listeners duplicados si onAuthStateChange se dispara más de una vez
    const newAccept = acceptBtn.cloneNode(true) as HTMLButtonElement
    const newReject = rejectBtn.cloneNode(true) as HTMLButtonElement
    acceptBtn.replaceWith(newAccept)
    rejectBtn.replaceWith(newReject)

    newAccept.addEventListener('click', async () => {
      setLoading(true)
      try {
        await acceptTermsAndCreateProfile(client, userId, email, username)
        hideModal()
      } catch {
        setLoading(false)
        showError('Hubo un error al crear tu cuenta. Intenta de nuevo.')
      }
    })

    // ── Botón Rechazar ───────────────────────────────────────────
    newReject.addEventListener('click', async () => {
      setLoading(true)
      try {
        await deleteAndSignOut(client)
      } finally {
        hideModal()
        // Redirigir al home público
        window.location.href = '/'
      }
    })
  })
}