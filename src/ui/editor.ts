import { countWords, DEFAULT_OPTIONS } from '../modules/auth/counter/index'
import { getAllPreviews, convertToStyle, STYLES, type UnicodeStyle } from '../modules/auth/unicode/index'
import { filterSymbols, getCategories, type Platform } from '../modules/auth/symbols/index'
import { getCurrentUser, signInWithEmail, signUpWithEmail, signOut, onAuthChange } from '../modules/auth/index'
import { getTemplates, createTemplate, deleteTemplate } from '../modules/auth/templates/index'
import { checkText } from '../modules/auth/corrector/index'

import { escapeHtml, sanitizeTemplateContent, sanitizeInput } from '../lib/security'

import { onConnectivityChange } from '../lib/connectivity'
import { bindBorradores } from './drafts'
import { bindVistaPrevia } from './preview'

import type { User, Template } from '../types/index'

type Tab = 'editor' | 'fuentes' | 'simbolos' | 'plantillas' | 'borradores' |  'vista_previa'

let activePlatform: Platform | '' = ''
let activeCategory = ''
// Cuando se aplica una sugerencia programáticamente, evitamos que el
// listener global de `input` cierre el panel del corrector.
let suppressCorrectorClose = false

export function initEditor(root: HTMLElement): void {
  root.innerHTML = buildShell()
  bindAuth()
  bindTabs()
  bindRegisterView()
  bindEditor()
  bindFuentes()
  bindSimbolos()
  bindPlantillas()
  bindBorradores()
  bindVistaPrevia()
  bindCorrector()
  bindConnectivity()
}


function buildShell(): string {
  return `
    <header id="auth-header" class="auth-header"></header>

    <!-- Registro (modal/panel) -->
    <div id="register-modal" class="register-modal hidden" role="dialog" aria-modal="true" aria-labelledby="register-title">
      <div class="register-overlay"></div>
      <div class="register-panel">
        <div class="register-header">
          <span id="register-title" class="register-title">Registro</span>
          <button type="button" class="register-close-btn" id="btn-register-close" aria-label="Cerrar">✕</button>
        </div>

        <form id="register-form" class="auth-form" autocomplete="off">
          <div class="register-field">
            <label class="register-label" for="reg-email">Correo</label>
            <input id="reg-email" class="hdr-input" type="email" placeholder="tu@email.com" autocomplete="email" />
          </div>

          <div class="register-field">
            <label class="register-label" for="reg-user">Usuario</label>
            <input id="reg-user" class="hdr-input" type="text" placeholder="Nombre de usuario (opcional)" autocomplete="username" />
            <small class="field-hint">Se usará la parte antes del @ si lo dejas vacío</small>
          </div>

          <div class="register-field">
            <label class="register-label" for="reg-password">Contraseña</label>
            <div class="password-input-wrap">
              <input id="reg-password" class="hdr-input" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password" />
              <button type="button" class="password-eye-btn" data-eye-target="reg-password" aria-label="Mostrar/ocultar">👁</button>
            </div>
          </div>

          <div class="register-field">
            <label class="register-label" for="reg-confirm-password">Confirmar contraseña</label>
            <div class="password-input-wrap">
              <input id="reg-confirm-password" class="hdr-input" type="password" placeholder="Repite tu contraseña" autocomplete="new-password" />
              <button type="button" class="password-eye-btn" data-eye-target="reg-confirm-password" aria-label="Mostrar/ocultar">👁</button>
            </div>
          </div>

          <div class="register-error" id="register-error" class="hidden"></div>

          <button type="submit" class="hdr-btn hdr-btn-login" id="btn-register-submit">Crear cuenta</button>
          <div class="auth-hint">Al registrarte, entrarás automáticamente.</div>
        </form>
      </div>
    </div>

    <div class="app-shell">
    <div id="offline-banner" class="offline-banner hidden">
      Sin conexión — trabajando offline
    </div>
      <nav class="tab-bar">
        <button class="tab-btn active" data-tab="editor">Editor</button>
        <button class="tab-btn" data-tab="fuentes">Fuentes</button>
        <button class="tab-btn" data-tab="simbolos">Símbolos</button>
        <button class="tab-btn" data-tab="plantillas">Plantillas</button>
        <button class="tab-btn" data-tab="borradores">Borradores</button>
        <button class="tab-btn" data-tab="vista_previa">Vista Previa</button>
      </nav>

      <div class="tab-panel active" id="panel-editor">
        <div class="editor-wrap">
          <div class="editor-container">
            <div id="editor-highlight" class="editor-highlight" aria-hidden="true"></div>
            <textarea
              id="main-editor"
              placeholder="Escribe tu historia aquí..."
              spellcheck="false"
            ></textarea>
          </div>
          <div class="editor-footer">
            <span id="word-count">0 palabras</span>
            <div class="editor-footer-actions">
              <button type="button" class="check-btn" id="btn-copy-all">Copiar todo</button>
              <button type="button" class="check-btn" id="btn-open-drafts-modal">→ Borradores</button>
              <button type="button" class="check-btn" id="btn-check">Revisar texto</button>
            </div>
          </div>
        </div>

        <div id="corrector-panel" class="corrector-panel hidden">
          <div class="corrector-header">
            <span class="corrector-title">Sugerencias</span>
            <button type="button" class="sym-clear-btn" id="btn-close-corrector">✕</button>
          </div>
          <div id="corrector-results" class="corrector-results"></div>
        </div>

        <div id="style-popup" class="style-popup hidden"></div>
      </div>

      <div class="tab-panel" id="panel-fuentes">
        <div class="fuentes-wrap">
          <input
            id="fuentes-input"
            type="text"
            placeholder="Escribe texto para previsualizar estilos..."
            autocomplete="off"
          />
          <div id="fuentes-list" class="fuentes-list"></div>
        </div>
      </div>

      <div class="tab-panel" id="panel-simbolos">
        <div class="simbolos-wrap">

          <div class="category-wrapper">
            <div id="cat-pills" class="cat-pills"></div>
          </div>

          <div class="platform-filter">
            <span class="filter-label">Compatibilidad:</span>
            <div id="plat-pills" class="plat-pills">
              <button class="plat-btn active" data-plat="">Todas</button>
              <button class="plat-btn" data-plat="facebook">Facebook</button>
              <button class="plat-btn" data-plat="facebook_lite">FB Lite</button>
              <button class="plat-btn" data-plat="instagram">Instagram</button>
              <button class="plat-btn" data-plat="twitter">Twitter / X</button>
              <button class="plat-btn" data-plat="whatsapp">WhatsApp</button>
              <button class="plat-btn" data-plat="tiktok">TikTok</button>
            </div>
          </div>

          <div class="sym-toolbar">
            <button type="button" class="cat-btn" id="sym-show-all">Mostrar todos</button>
          </div>

          <div class="sym-selected">
            <div class="sym-selected-header">
              <span class="sym-selected-label">Seleccionados</span>
              <button type="button" class="sym-copy-btn" id="sym-copy">Copiar</button>
              <button type="button" class="sym-clear-btn" id="sym-clear">Limpiar</button>
            </div>
            <textarea
              id="sym-selected-input"
              class="sym-selected-input"
              rows="2"
              placeholder="Los símbolos que presiones aparecen aquí..."
              spellcheck="false"
            ></textarea>
          </div>

          <div id="sym-grid" class="sym-grid"></div>

        </div>
      </div>

      <div class="tab-panel" id="panel-plantillas">
        <div class="plantillas-wrap">

          <!-- Sub-navegación de plantillas -->
          <div class="plantillas-subnav">
            <button class="subnav-btn active" data-subtab="mis-plantillas">Mis Plantillas</button>
            <button class="subnav-btn" data-subtab="predefinidas">Plantillas Predefinidas</button>
          </div>

          <!-- Sección: Mis Plantillas (requiere login) -->
          <div class="subtab-panel active" id="subtab-mis-plantillas">
            <div id="auth-section" class="auth-section"></div>

            <div id="templates-section" class="templates-section hidden">
              <div class="templates-toolbar">
                <button type="button" class="cat-btn" id="btn-new-template">
                  + Nueva plantilla
                </button>
                <span id="templates-user-email" class="templates-user-email"></span>
                <button type="button" class="sym-clear-btn" id="btn-sign-out">
                  Cerrar sesión
                </button>
              </div>

              <div id="new-template-form" class="new-template-form hidden">
                <input
                  id="tpl-name"
                  type="text"
                  placeholder="Nombre de la plantilla..."
                  class="tpl-input"
                  autocomplete="off"
                />
                <select id="tpl-type" class="tpl-input">
                  <option value="header">Encabezado</option>
                  <option value="separator">Separador</option>
                  <option value="character_sheet">Ficha de personaje</option>
                  <option value="dialogue">Formato de diálogo</option>
                  <option value="custom">Personalizado</option>
                </select>
                <textarea
                  id="tpl-content"
                  class="tpl-textarea"
                  rows="4"
                  placeholder="Contenido de la plantilla..."
                  spellcheck="false"
                ></textarea>
                <div class="tpl-form-actions">
                  <button type="button" class="sym-copy-btn" id="btn-save-template">Guardar</button>
                  <button type="button" class="sym-clear-btn" id="btn-cancel-template">Cancelar</button>
                </div>
              </div>

              <div id="templates-list" class="templates-list"></div>
            </div>
          </div>

          <!-- Sección: Plantillas Predefinidas -->
          <div class="subtab-panel" id="subtab-predefinidas">
            <div class="predefinidas-categories">
              <button class="cat-btn active" data-predef="banners">Banners</button>
              <button class="cat-btn" data-predef="separadores">Separadores</button>
              <button class="cat-btn" data-predef="about">About Me</button>
              <button class="cat-btn" data-predef="ficha">Ficha de Personaje</button>
            </div>

            <div id="predefinidas-content" class="predefinidas-content">
              <!-- Aquí se renderizan las plantillas predefinidas -->
            </div>
          </div>

        </div>
      </div>

      <div class="tab-panel" id="panel-borradores">
        <div class="borradores-wrap">
          <div id="drafts-list" class="drafts-list"></div>
        </div>
      </div>


      <div class="tab-panel" id="panel-vista_previa">
        <div class="vista-previa-wrap">
          <div class="vista-previa-controls">
            <button type="button" class="cat-btn" id="btn-toggle-view">📱 Móvil</button>
            <div id="platform-preview-buttons" class="platform-preview-buttons"></div>
          </div>
          <div id="vista-previa-container" class="vista-previa-container"></div>
        </div>
      </div>

    </div>
      </div> <!-- Cierre de app-shell -->
    
    <!-- ✅ Modal de borradores (fuera de cualquier panel) -->
    <div id="drafts-modal" class="drafts-modal hidden">
      <div class="drafts-overlay"></div>
      <div class="drafts-panel">
        <div class="drafts-panel-header">
          <span class="drafts-panel-title">Guardar en borrador</span>
          <button type="button" class="sym-clear-btn" id="btn-close-drafts-modal">✕</button>
        </div>
        <div id="drafts-modal-slots" class="drafts-modal-slots"></div>
      </div>
    </div>

  `
}

// ─── Tabs ─────────────────────────────────────────────────────────

function bindTabs(): void {
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset['tab'] as Tab

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'))

      btn.classList.add('active')
      document.getElementById(`panel-${tab}`)!.classList.add('active')

      if (tab === 'fuentes') {
        const editor = document.getElementById('main-editor') as HTMLTextAreaElement
        const input = document.getElementById('fuentes-input') as HTMLInputElement
        if (!input.value && editor.value) {
          input.value = editor.value.slice(0, 80)
        }
        renderFuentes(input.value)
      }

      if (tab === 'simbolos') {
        const pills = document.getElementById('cat-pills')!
        if (!pills.hasChildNodes()) initCategories()
      }

      // ✅ Manejar sub-navegación de plantillas (DENTRO del click)
      if (tab === 'plantillas') {
        const subnavBtns = document.querySelectorAll<HTMLButtonElement>('.subnav-btn')
        subnavBtns.forEach(subBtn => {
          subBtn.addEventListener('click', () => {
            const subtab = subBtn.dataset['subtab'] || ''
            
            document.querySelectorAll('.subnav-btn').forEach(b => b.classList.remove('active'))
            document.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'))
            
            subBtn.classList.add('active')
            document.getElementById(`subtab-${subtab}`)!.classList.add('active')
            
            // Si es predefinidas, renderizar contenido
            if (subtab === 'predefinidas') {
              renderPredefinidas('banners')
            }
          })
        })

        // Manejar categorías de plantillas predefinidas
        const catBtns = document.querySelectorAll<HTMLButtonElement>('[data-predef]')
        catBtns.forEach(catBtn => {
          catBtn.addEventListener('click', () => {
            const category = catBtn.dataset['predef'] || ''
            
            document.querySelectorAll('[data-predef]').forEach(b => b.classList.remove('active'))
            catBtn.classList.add('active')
            
            renderPredefinidas(category)
          })
        })
      }
    })
  })
}

// ─── Editor + contador + highlights + popup ───────────────────────


function applyWordHighlights(text: string): void {
  const highlight = document.getElementById('editor-highlight')!

  // Si el corrector está activo, no pisamos sus highlights
  const correctorPanel = document.getElementById('corrector-panel')!
  if (!correctorPanel.classList.contains('hidden')) return

  const segmenter = new Intl.Segmenter('es', { granularity: 'word' })
  const segments = [...segmenter.segment(text)]

  let result = ''
  for (const seg of segments) {
    const escaped = escapeHtml(seg.segment)
    if (seg.isWordLike && /\p{L}/u.test(seg.segment) && !/^\d+$/.test(seg.segment)) {
      result += `<mark class="word-highlight">${escaped}</mark>`
    } else {
      result += escaped
    }
  }

  highlight.innerHTML = result + '\n'
}

function applyErrorHighlights(text: string, suggestions: Array<{ offset: number; length: number }>): void {
  const highlight = document.getElementById('editor-highlight')!

  if (suggestions.length === 0) {
    highlight.innerHTML = escapeHtml(text) + '\n'
    return
  }

  const sorted = [...suggestions].sort((a, b) => a.offset - b.offset)
  let result = ''
  let cursor = 0

  for (const s of sorted) {
    result += escapeHtml(text.slice(cursor, s.offset))
    result += `<mark class="error-highlight">${escapeHtml(text.slice(s.offset, s.offset + s.length))}</mark>`
    cursor = s.offset + s.length
  }

  result += escapeHtml(text.slice(cursor))
  highlight.innerHTML = result + '\n'
}

function bindEditor(): void {
  const editor = document.getElementById('main-editor') as HTMLTextAreaElement
  const counter = document.getElementById('word-count')!
  const popup = document.getElementById('style-popup')!

    editor.addEventListener('input', () => {
    const n = countWords(editor.value, DEFAULT_OPTIONS)
    counter.textContent = `${n} ${n === 1 ? 'palabra' : 'palabras'}`

    // Si el corrector está abierto, NO lo cerramos cuando la modificación
    // proviene de una aplicación programática de sugerencia. Usamos
    // `suppressCorrectorClose` para distinguir la fuente del input.
    const correctorPanel = document.getElementById('corrector-panel')!
    if (!correctorPanel.classList.contains('hidden')) {
      if (suppressCorrectorClose) {
        // La modificación viene del click en una sugerencia; mantenemos el panel abierto.
        suppressCorrectorClose = false
      } else {
        correctorPanel.classList.add('hidden')
        document.getElementById('corrector-results')!.innerHTML = ''
      }
    }

    applyWordHighlights(editor.value)
    })

  // Sincroniza scroll del highlight con el textarea
  editor.addEventListener('scroll', () => {
    const highlight = document.getElementById('editor-highlight')!
    highlight.scrollTop = editor.scrollTop
    highlight.scrollLeft = editor.scrollLeft
  })

  function checkSelection(): void {
    const start = editor.selectionStart
    const end = editor.selectionEnd

    if (end - start < 1) {
      popup.classList.add('hidden')
      return
    }

    const selectedText = editor.value.slice(start, end)
    if (!selectedText.trim()) {
      popup.classList.add('hidden')
      return
    }

    const rect = editor.getBoundingClientRect()
    const appRect = document.querySelector('.app-shell')!.getBoundingClientRect()
    popup.style.top = `${rect.top - appRect.top - 52}px`
    popup.style.left = `0`

    renderPopup(selectedText, start, end)
    popup.classList.remove('hidden')
  }

  editor.addEventListener('mouseup', checkSelection)
  editor.addEventListener('keyup', checkSelection)

  document.addEventListener('mousedown', (e) => {
    if (!popup.contains(e.target as Node) && e.target !== editor) {
      popup.classList.add('hidden')
    }
  })
    // Botón Copiar todo
  document.getElementById('btn-copy-all')?.addEventListener('click', () => {
    if (!editor.value) return
    
    navigator.clipboard.writeText(editor.value).then(() => {
      const btn = document.getElementById('btn-copy-all')
      if (btn) {
        const originalText = btn.textContent
        btn.textContent = '✓ Copiado'
        setTimeout(() => {
          btn.textContent = originalText || 'Copiar todo'
        }, 2000)
      }
    }).catch(err => {
      console.error('Error al copiar:', err)
      // Fallback para navegadores antiguos
      editor.select()
      document.execCommand('copy')
      editor.selectionStart = editor.selectionEnd = 0
    })
  })
}

function renderPopup(selectedText: string, start: number, end: number): void {
  const popup = document.getElementById('style-popup')!
  const editor = document.getElementById('main-editor') as HTMLTextAreaElement

  const previewStyles: UnicodeStyle[] = ['bold', 'script', 'boldScript', 'doubleStruck']

  const buttons = previewStyles.map(style => {
    const preview = convertToStyle(selectedText, style)
    return `
      <button class="popup-style-btn" data-style="${style}" title="${STYLES[style].label}">
        ${preview}
      </button>
    `
  }).join('')

  popup.innerHTML = `
    <span class="popup-label">Estilo:</span>
    ${buttons}
    <button class="popup-more-btn" id="popup-more">más →</button>
  `

  popup.querySelectorAll<HTMLButtonElement>('.popup-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const style = btn.dataset['style'] as UnicodeStyle
      const converted = convertToStyle(selectedText, style)
      editor.value = editor.value.slice(0, start) + converted + editor.value.slice(end)
      editor.dispatchEvent(new Event('input'))
      popup.classList.add('hidden')
    })
  })

  document.getElementById('popup-more')!.addEventListener('click', () => {
    popup.innerHTML = `
      <span class="popup-label">Todos los estilos:</span>
      <div class="popup-all-styles" id="popup-all-styles"></div>
    `

    const allContainer = document.getElementById('popup-all-styles')!
    const allStyles = Object.keys(STYLES) as UnicodeStyle[]

    allContainer.innerHTML = allStyles.map(style => {
      const preview = convertToStyle(selectedText, style)
      return `
        <button class="popup-style-btn" data-style="${style}" title="${STYLES[style].label}">
          ${preview}
        </button>
      `
    }).join('')

    allContainer.querySelectorAll<HTMLButtonElement>('.popup-style-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.dataset['style'] as UnicodeStyle
        const converted = convertToStyle(selectedText, style)
        editor.value = editor.value.slice(0, start) + converted + editor.value.slice(end)
        editor.dispatchEvent(new Event('input'))
        popup.classList.add('hidden')
      })
    })
  })
}

// ─── Tab Fuentes ──────────────────────────────────────────────────

function bindFuentes(): void {
  const input = document.getElementById('fuentes-input') as HTMLInputElement

  let debounce: ReturnType<typeof setTimeout>
  input.addEventListener('input', () => {
    clearTimeout(debounce)
    debounce = setTimeout(() => renderFuentes(input.value), 150)
  })
}

function renderFuentes(text: string): void {
  const list = document.getElementById('fuentes-list')!
  const sample = text || 'Escribe algo para previsualizar'
  const previews = getAllPreviews(sample)

  list.innerHTML = previews.map(p => `
    <div class="fuente-row">
      <span class="fuente-label">${p.label}</span>
      <span class="fuente-result">${p.result}</span>
      <button class="fuente-copy-btn" data-text="${encodeURIComponent(p.result)}">
        Copiar
      </button>
    </div>
  `).join('')

  list.querySelectorAll<HTMLButtonElement>('.fuente-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const decoded = decodeURIComponent(btn.dataset['text'] ?? '')
      navigator.clipboard.writeText(decoded).then(() => {
        btn.textContent = '✓'
        setTimeout(() => { btn.textContent = 'Copiar' }, 1500)
      })
    })
  })
}

// ─── Tab Símbolos ─────────────────────────────────────────────────

async function initCategories(): Promise<void> {
  const pills = document.getElementById('cat-pills')!
  const categories = await getCategories()

  activeCategory = categories[0] ?? ''

  pills.innerHTML = categories.map((cat, i) => `
    <button class="cat-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">
      ${cat}
    </button>
  `).join('')

  pills.querySelectorAll<HTMLButtonElement>('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      pills.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      activeCategory = btn.dataset['cat'] ?? ''
      document.body.dataset['symbolsShowAll'] = 'false'
      renderSymbols()
    })
  })

  document.getElementById('sym-show-all')?.addEventListener('click', () => {
    document.body.dataset['symbolsShowAll'] = 'true'
    renderSymbols()
  })

  renderSymbols()
}

function bindSimbolos(): void {
  const platPills = document.getElementById('plat-pills')!
  const symSelectedInput = document.getElementById('sym-selected-input') as HTMLTextAreaElement

  document.getElementById('sym-copy')?.addEventListener('click', () => {
    if (!symSelectedInput.value) return
    navigator.clipboard.writeText(symSelectedInput.value).then(() => {
      const btn = document.getElementById('sym-copy')!
      btn.textContent = '✓'
      setTimeout(() => { btn.textContent = 'Copiar' }, 1500)
    })
  })

  document.getElementById('sym-clear')?.addEventListener('click', () => {
    symSelectedInput.value = ''
  })

  platPills.querySelectorAll<HTMLButtonElement>('.plat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      platPills.querySelectorAll('.plat-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      activePlatform = (btn.dataset['plat'] ?? '') as Platform | ''
      renderSymbols()
    })
  })
}

async function renderSymbols(): Promise<void> {
  const grid = document.getElementById('sym-grid')!
  grid.innerHTML = '<p class="sym-loading">Cargando...</p>'

  const showAll = document.body.dataset['symbolsShowAll'] === 'true'

  const symbols = await filterSymbols({
    category: showAll ? undefined : (activeCategory || undefined),
    platform: (activePlatform as Platform) || undefined,
  })

  if (symbols.length === 0) {
    grid.innerHTML = '<p class="sym-loading">Sin símbolos en esta categoría.</p>'
    return
  }

  const statusIcon: Record<string, string> = {
    supported: '✅',
    partial: '⚠️',
    unsupported: '❌',
  }

  grid.innerHTML = symbols.map(s => {
    const indicator = activePlatform
      ? `<span class="sym-status">${statusIcon[s.compatibility[activePlatform as Platform]]}</span>`
      : ''
    return `
      <button class="sym-btn" data-symbol="${s.symbol}" title="${s.name}" type="button">
        <span class="sym-char">${s.symbol}</span>
        ${indicator}
      </button>
    `
  }).join('')

  grid.querySelectorAll<HTMLButtonElement>('.sym-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const symbol = btn.dataset['symbol'] ?? ''
      const selectedArea = document.getElementById('sym-selected-input') as HTMLTextAreaElement
      selectedArea.value += symbol
    })
  })
}

// ─── Auth Header ──────────────────────────────────────────────────

function bindAuth(): void {
  getCurrentUser().then(user => renderAuthHeader(user))

  onAuthChange(user => {
    renderAuthHeader(user)
    const modal = document.getElementById('register-modal')
    if (modal && user) modal.classList.add('hidden')
  })
}

function bindRegisterView(): void {
  const modal = document.getElementById('register-modal')!
  if (!modal) return

  const closeBtn = document.getElementById('btn-register-close')
  const emailInput = document.getElementById('reg-email') as HTMLInputElement | null
  const userInput = document.getElementById('reg-user') as HTMLInputElement | null
  const passwordInput = document.getElementById('reg-password') as HTMLInputElement | null
  const confirmInput = document.getElementById('reg-confirm-password') as HTMLInputElement | null
  const errorEl = document.getElementById('register-error')
  const form = document.getElementById('register-form') as HTMLFormElement | null

  function hide(): void {
    modal.classList.add('hidden')
    modal.classList.remove('show')
  }

  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    hide()
  })

  modal.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('register-overlay')) {
      hide()
    }
  })

  // HABILITAR el campo de usuario y hacerlo editable
  if (userInput) {
    userInput.disabled = false
    userInput.placeholder = 'Nombre de usuario (opcional)'
  }


  // Ojo para mostrar/ocultar contraseña
  modal.querySelectorAll<HTMLButtonElement>('.password-eye-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset['eye-target']
      const input = (id ? document.getElementById(id) : null) as HTMLInputElement | null
      if (!input) return
      const isPassword = input.type === 'password'
      input.type = isPassword ? 'text' : 'password'
    })
  })

    form?.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = emailInput?.value.trim() ?? ''
    const username = userInput?.value.trim() || (email.includes('@') ? email.split('@')[0] : '')
    const password = passwordInput?.value ?? ''
    const confirmPassword = confirmInput?.value ?? ''

    // ✅ VALIDAR EMAIL
    if (!email.includes('@') || email.length < 5) {
      if (errorEl) {
        errorEl.textContent = 'Email inválido'
        errorEl.classList.remove('hidden')
      }
      return
    }

    // ✅ VALIDAR USERNAME (si lo proporcionó)
    if (username && !/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
      if (errorEl) {
        errorEl.textContent = 'Username inválido (3-30 caracteres, solo letras, números, guiones)'
        errorEl.classList.remove('hidden')
      }
      return
    }

    // ✅ VALIDAR CAMPOS OBLIGATORIOS
    if (!email || !password || !confirmPassword) {
      if (errorEl) {
        errorEl.textContent = 'Todos los campos son obligatorios'
        errorEl.classList.remove('hidden')
      }
      return
    }
    
    // ✅ VALIDAR LONGITUD DE CONTRASEÑA
    if (password.length < 6) {
      if (errorEl) {
        errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres'
        errorEl.classList.remove('hidden')
      }
      return
    }
    
    // ✅ VALIDAR QUE LAS CONTRASEÑAS COINCIDAN
    if (password !== confirmPassword) {
      if (errorEl) {
        errorEl.textContent = 'Las contraseñas no coinciden.'
        errorEl.classList.remove('hidden')
      }
      return
    }

    if (errorEl) {
      errorEl.textContent = ''
      errorEl.classList.add('hidden')
    }

    const submitBtn = document.getElementById('btn-register-submit') as HTMLButtonElement | null
    if (submitBtn) {
      submitBtn.textContent = 'Creando...'
      submitBtn.setAttribute('disabled', '')
    }

    const { error } = await signUpWithEmail(email, password, username)

    if (submitBtn) {
      submitBtn.textContent = 'Crear cuenta'
      submitBtn.removeAttribute('disabled')
    }

    if (error) {
      if (errorEl) {
        errorEl.textContent = error
        errorEl.classList.remove('hidden')
      }
      return
    }

    hide()
  })
}


function renderAuthHeader(user: User | null): void {
  const header = document.getElementById('auth-header')!

  if (!user) {
    header.innerHTML = `
      <div class="auth-header-content">
        <div class="auth-header-form">
          <input id="hdr-email" type="email" class="hdr-input" placeholder="Email" autocomplete="email"/>
          <input id="hdr-password" type="password" class="hdr-input" placeholder="Contraseña" autocomplete="current-password"/>
          <button type="button" class="hdr-btn hdr-btn-login" id="hdr-btn-login">Entrar</button>
          <button type="button" class="hdr-btn hdr-btn-register" id="hdr-btn-register">Registro</button>
        </div>
      </div>
    `

    document.getElementById('hdr-btn-login')!.addEventListener('click', async () => {
      const email = (document.getElementById('hdr-email') as HTMLInputElement).value
      const password = (document.getElementById('hdr-password') as HTMLInputElement).value

      if (!email || !password) return

      const btn = document.getElementById('hdr-btn-login')!
      btn.textContent = '...'
      btn.setAttribute('disabled', '')

      const { error } = await signInWithEmail(email, password)
      if (error) {
        btn.textContent = 'Entrar'
        btn.removeAttribute('disabled')
      }
    })

document.getElementById('hdr-btn-register')!.addEventListener('click', async () => {
      const modal = document.getElementById('register-modal')
      if (!modal) return

      // precargar email desde header
      const email = (document.getElementById('hdr-email') as HTMLInputElement | null)?.value ?? ''
      const emailInput = document.getElementById('reg-email') as HTMLInputElement | null
      if (emailInput) emailInput.value = email

      const userInput = document.getElementById('reg-user') as HTMLInputElement | null
      if (userInput) userInput.value = email ? email.split('@')[0] : ''

      modal.classList.remove('hidden')
      modal.classList.add('show')

      // Enfocar
      ;(document.getElementById('reg-email') as HTMLInputElement | null)?.focus()
    })

  } else {
        header.innerHTML = `
          <div class="auth-header-content">
            <span class="hdr-user-email">${user.username ?? user.email}</span>
            <button type="button" class="hdr-btn hdr-btn-logout" id="hdr-btn-logout">Cerrar sesión</button>
          </div>
        `

    document.getElementById('hdr-btn-logout')!.addEventListener('click', async () => {
      await signOut()
    })
  }
}

// ─── Tab Plantillas ───────────────────────────────────────────────

function bindPlantillas(): void {
  onAuthChange(user => {
    renderAuthState(user)
  })

  getCurrentUser().then(user => renderAuthState(user))
}

function renderAuthState(user: User | null): void {
  const authSection = document.getElementById('auth-section')!
  const templatesSection = document.getElementById('templates-section')!

  if (!user) {
    templatesSection.classList.add('hidden')
    // El login ya está en el header; en plantillas solo mostramos un mensaje.
    authSection.innerHTML = `
      <div class="auth-form auth-form--readonly">
        <h2 class="auth-title">Inicia sesión para guardar plantillas</h2>
        <p class="auth-hint">Usa el formulario del header (arriba) para entrar.</p>
      </div>
    `
    return
  }

  authSection.innerHTML = ''
  templatesSection.classList.remove('hidden')

  const emailEl = document.getElementById('templates-user-email')
  if (emailEl) emailEl.textContent = user.email

  document.getElementById('btn-sign-out')?.addEventListener('click', async () => {
    await signOut()
  })

  document.getElementById('btn-new-template')?.addEventListener('click', () => {
    document.getElementById('new-template-form')!.classList.toggle('hidden')
  })

  document.getElementById('btn-cancel-template')?.addEventListener('click', () => {
    document.getElementById('new-template-form')!.classList.add('hidden')
    clearTemplateForm()
  })

    document.getElementById('btn-save-template')?.addEventListener('click', async () => {
    const name = (document.getElementById('tpl-name') as HTMLInputElement).value.trim()
    const type = (document.getElementById('tpl-type') as HTMLSelectElement).value
    const content = (document.getElementById('tpl-content') as HTMLTextAreaElement).value.trim()

    // ✅ VALIDAR nombre
    if (!name || name.length < 3) {
      alert('El nombre de la plantilla debe tener al menos 3 caracteres')
      return
    }

    // ✅ VALIDAR contenido
    if (!content || content.length < 1) {
      alert('El contenido no puede estar vacío')
      return
    }

    // ✅ SANITIZAR contenido (eliminar scripts y tags peligrosos)
    const sanitizedContent = sanitizeTemplateContent(content)

    const btn = document.getElementById('btn-save-template')!
    btn.textContent = 'Guardando...'

    const { error } = await createTemplate({
      name: sanitizeInput(name),
      type: type as Template['type'],
      content: sanitizedContent,
      tags: [],
    })

    if (!error) {
      document.getElementById('new-template-form')!.classList.add('hidden')
      clearTemplateForm()
      renderTemplatesList()
    }

    btn.textContent = 'Guardar'
  })

  renderTemplatesList()
}



function clearTemplateForm(): void {
  (document.getElementById('tpl-name') as HTMLInputElement).value = ''
  ;(document.getElementById('tpl-content') as HTMLTextAreaElement).value = ''
  ;(document.getElementById('tpl-type') as HTMLSelectElement).selectedIndex = 0
}

async function renderTemplatesList(): Promise<void> {
  const list = document.getElementById('templates-list')!
  list.innerHTML = '<p class="sym-loading">Cargando plantillas...</p>'

  const templates = await getTemplates()

  if (templates.length === 0) {
    list.innerHTML = '<p class="sym-loading">No tienes plantillas guardadas aún.</p>'
    return
  }

  const typeLabel: Record<string, string> = {
    header: 'Encabezado',
    separator: 'Separador',
    character_sheet: 'Ficha de personaje',
    dialogue: 'Diálogo',
    custom: 'Personalizado',
  }

  // ✅ ESCAPAR todos los datos al renderizar para prevenir XSS
  list.innerHTML = templates.map(t => `
    <div class="template-card" data-id="${escapeHtml(t.id)}">
      <div class="template-card-header">
        <span class="template-name">${escapeHtml(t.name)}</span>
        <span class="template-type">${escapeHtml(typeLabel[t.type] ?? t.type)}</span>
      </div>
      <div class="template-content">${escapeHtml(t.content)}</div>
      <div class="template-actions">
        <button class="sym-copy-btn tpl-btn-use" data-content="${encodeURIComponent(t.content)}">
          Usar en editor
        </button>
        <button class="sym-copy-btn tpl-btn-copy" data-content="${encodeURIComponent(t.content)}">
          Copiar
        </button>
        <button class="sym-clear-btn tpl-btn-delete" data-id="${escapeHtml(t.id)}">
          Eliminar
        </button>
      </div>
    </div>
  `).join('')

  list.querySelectorAll<HTMLButtonElement>('.tpl-btn-use').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = decodeURIComponent(btn.dataset['content'] ?? '')
      const editor = document.getElementById('main-editor') as HTMLTextAreaElement
      const start = editor.selectionStart
      const end = editor.selectionEnd

      editor.value = editor.value.slice(0, start) + content + editor.value.slice(end)
      editor.selectionStart = editor.selectionEnd = start + content.length
      editor.dispatchEvent(new Event('input'))

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'))
      document.querySelector<HTMLButtonElement>('[data-tab="editor"]')!.classList.add('active')
      document.getElementById('panel-editor')!.classList.add('active')
    })
  })

  list.querySelectorAll<HTMLButtonElement>('.tpl-btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = decodeURIComponent(btn.dataset['content'] ?? '')
      navigator.clipboard.writeText(content).then(() => {
        btn.textContent = '✓'
        setTimeout(() => { btn.textContent = 'Copiar' }, 1500)
      })
    })
  })

  list.querySelectorAll<HTMLButtonElement>('.tpl-btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset['id'] ?? ''
      if (!id) return
      await deleteTemplate(id)
      renderTemplatesList()
    })
  })
}

function renderPredefinidas(category: string): void {
  const content = document.getElementById('predefinidas-content')!
  
  if (category === 'banners') {
    content.innerHTML = `
      <div class="predefinida-item">
        <h4>Separador Simple</h4>
        <pre>✦·...·✦</pre>
        <button class="sym-copy-btn" data-copy="✦·...·✦">Copiar</button>
      </div>
      <div class="predefinida-item">
        <h4>Separador con Texto</h4>
        <input type="text" class="tpl-input" placeholder="Tu texto" data-banner-input="separator" />
        <pre data-banner-preview="separator">✦·[texto]·✦</pre>
        <button class="sym-copy-btn" data-banner-copy="separator">Copiar</button>
      </div>
    `
  } else if (category === 'about') {
    content.innerHTML = `
      <div class="predefinida-item">
        <h4>About Me Básico</h4>
        <input type="text" class="tpl-input" placeholder="Nombre" data-about="name" />
        <input type="text" class="tpl-input" placeholder="Facción" data-about="faction" />
        <input type="text" class="tpl-input" placeholder="Edad" data-about="age" />
        <input type="text" class="tpl-input" placeholder="Profesión" data-about="job" />
        <input type="text" class="tpl-input" placeholder="Características" data-about="traits" />
        <pre data-about-preview></pre>
        <button class="sym-copy-btn" data-about-copy>Copiar</button>
      </div>
    `
  } else if (category === 'ficha') {
    content.innerHTML = `
      <div class="predefinida-item">
        <h4>Ficha de Personaje</h4>
        <input type="text" class="tpl-input" placeholder="Nombre" data-char="name" />
        <input type="text" class="tpl-input" placeholder="Raza" data-char="race" />
        <input type="text" class="tpl-input" placeholder="Clase" data-char="class" />
        <input type="text" class="tpl-input" placeholder="Nivel" data-char="level" />
        <input type="text" class="tpl-input" placeholder="Características" data-char="traits" />
        <pre data-char-preview></pre>
        <button class="sym-copy-btn" data-char-copy>Copiar</button>
      </div>
    `
  }

  attachPredefinidasHandlers(category)
}

function attachPredefinidasHandlers(category: string): void {
  // Manejar copiar botones simples
  document.querySelectorAll<HTMLElement>('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.dataset['copy'] || ''
      navigator.clipboard.writeText(text)
      btn.textContent = '✓'
      setTimeout(() => { btn.textContent = 'Copiar' }, 1500)
    })
  })

  // Manejar inputs de separador
  document.querySelectorAll('[data-banner-input="separator"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value
      const preview = document.querySelector('[data-banner-preview="separator"]')
      if (preview) {
        preview.textContent = value ? `✦·${value}·✦` : '✦·[texto]·✦'
      }
    })
  })

  document.querySelectorAll('[data-banner-copy="separator"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.querySelector('[data-banner-input="separator"]') as HTMLInputElement
      const text = input?.value ? `·${input.value}·✦` : '✦·...·✦'
      navigator.clipboard.writeText(text)
      btn.textContent = '✓'
      setTimeout(() => { btn.textContent = 'Copiar' }, 1500)
    })
  })

  // Manejar About Me
  if (category === 'about') {
    const updateAbout = () => {
      const name = (document.querySelector('[data-about="name"]') as HTMLInputElement)?.value || ''
      const faction = (document.querySelector('[data-about="faction"]') as HTMLInputElement)?.value || ''
      const age = (document.querySelector('[data-about="age"]') as HTMLInputElement)?.value || ''
      const job = (document.querySelector('[data-about="job"]') as HTMLInputElement)?.value || ''
      const traits = (document.querySelector('[data-about="traits"]') as HTMLInputElement)?.value || ''
      
      const parts = [name, faction, age, job, traits].filter(Boolean)
      const result = parts.join(' | ') || '(vacío)'
      
      const preview = document.querySelector('[data-about-preview]')
      if (preview) preview.textContent = result
    }

    document.querySelectorAll('[data-about]').forEach(input => {
      input.addEventListener('input', updateAbout)
    })

    document.querySelectorAll('[data-about-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const preview = document.querySelector('[data-about-preview]')
        if (preview) {
          navigator.clipboard.writeText(preview.textContent || '')
          btn.textContent = '✓'
          setTimeout(() => { btn.textContent = 'Copiar' }, 1500)
        }
      })
    })
  }

  // Manejar Ficha de Personaje
  if (category === 'ficha') {
    const updateChar = () => {
      const name = (document.querySelector('[data-char="name"]') as HTMLInputElement)?.value || ''
      const race = (document.querySelector('[data-char="race"]') as HTMLInputElement)?.value || ''
      const charClass = (document.querySelector('[data-char="class"]') as HTMLInputElement)?.value || ''
      const level = (document.querySelector('[data-char="level"]') as HTMLInputElement)?.value || ''
      const traits = (document.querySelector('[data-char="traits"]') as HTMLInputElement)?.value || ''

      const line1 = `┌${'─'.repeat(30)}`
      const line2 = `│ ${name.padEnd(28)} │`
      const line3 = `│ ${(race + ' ' + charClass).padEnd(28)} │`
      const line4 = `│ Nivel: ${level.padEnd(20)} │`
      const line5 = `│ ${traits.padEnd(28)} │`
      const line6 = `└${'─'.repeat(30)}┘`
      
      const result = [line1, line2, line3, line4, line5, line6].join('\n')
      
      const preview = document.querySelector('[data-char-preview]')
      if (preview) preview.textContent = result
    }

    document.querySelectorAll('[data-char]').forEach(input => {
      input.addEventListener('input', updateChar)
    })

    document.querySelectorAll('[data-char-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const preview = document.querySelector('[data-char-preview]')
        if (preview) {
          navigator.clipboard.writeText(preview.textContent || '')
          btn.textContent = '✓'
          setTimeout(() => { btn.textContent = 'Copiar' }, 1500)
        }
      })
    })
  }
}
// ─── Corrector ────────────────────────────────────────────────────

function bindCorrector(): void {
  const btn = document.getElementById('btn-check')!
  const panel = document.getElementById('corrector-panel')!
  const results = document.getElementById('corrector-results')!
  const closeBtn = document.getElementById('btn-close-corrector')!
  const editorEl = document.getElementById('main-editor') as HTMLTextAreaElement

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden')
    // Vuelve a mostrar highlights de palabras
    applyWordHighlights(editorEl.value)
  })

  editorEl.addEventListener('scroll', () => {
    const highlight = document.getElementById('editor-highlight')!
    highlight.scrollTop = editorEl.scrollTop
    highlight.scrollLeft = editorEl.scrollLeft
  })

  btn.addEventListener('click', async () => {
    const text = editorEl.value

    if (!text.trim()) return

    panel.classList.remove('hidden')
    results.innerHTML = '<p class="corrector-loading">Revisando...</p>'
    btn.textContent = 'Revisando...'
    btn.setAttribute('disabled', '')

    const { suggestions, error } = await checkText(text)

    btn.textContent = 'Revisar texto'
    btn.removeAttribute('disabled')

    if (error) {
      results.innerHTML = `<p class="corrector-error">${error}</p>`
      return
    }

    if (suggestions.length === 0) {
      results.innerHTML = '<p class="corrector-ok">✓ No se encontraron errores.</p>'
      applyErrorHighlights(text, [])
      return
    }

    // Resalta errores en el editor
    // IMPORTANTÍSIMO: ordenamos por offset y resolvemos solapamientos.
    // LanguageTool puede devolver matches que se solapan; si aplicas solo una,
    // el resto puede quedar corrupto y parecer que “se aplicaron todas”.
    const normalized = [...suggestions]
      .sort((a, b) => a.offset - b.offset || b.length - a.length)

    const nonOverlapping: typeof normalized = []
    let lastEnd = -1
    for (const s of normalized) {
      const end = s.offset + s.length
      if (s.offset < lastEnd) {
        // se solapa con el match anterior; lo descartamos para mantener offsets consistentes
        continue
      }
      nonOverlapping.push(s)
      lastEnd = end
    }

    applyErrorHighlights(text, nonOverlapping)

    const remainingById = nonOverlapping.map((s, i) => ({
      id: i,
      offset: s.offset,
      length: s.length,
      original: s.original,
      message: s.message,
      replacements: s.replacements,
    }))

    results.innerHTML = remainingById.map((s) => `
      <div class="suggestion-card" data-sug-id="${s.id}">
        <div class="suggestion-header">
          <span class="suggestion-original">${escapeHtml(s.original)}</span>
          <span class="suggestion-message">${escapeHtml(s.message)}</span>
        </div>
        ${s.replacements.length > 0 ? `
          <div class="suggestion-replacements">
            ${s.replacements.map(r => `
              <button
                class="suggestion-replace-btn"
                data-offset="${s.offset}"
                data-length="${s.length}"
                data-original="${encodeURIComponent(s.original)}"
                data-replacement="${encodeURIComponent(r)}"
              >${escapeHtml(r)}</button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')


    // Handler reutilizable para botones de reemplazo
    async function handleReplace(replaceBtn: HTMLButtonElement) {
      const offset = parseInt(replaceBtn.dataset['offset'] ?? '0')
      const length = parseInt(replaceBtn.dataset['length'] ?? '0')
      const replacement = decodeURIComponent(replaceBtn.dataset['replacement'] ?? '')
      const original = decodeURIComponent(replaceBtn.dataset['original'] ?? '')

      // Verifica que el texto en esa posición no haya cambiado
      const currentSlice = editorEl.value.slice(offset, offset + length)
      if (currentSlice !== original) {
        replaceBtn.closest('.suggestion-card')?.remove()
        return
      }

      // Indicamos que el próximo `input` proviene del aplicador de sugerencias
      // para evitar que el panel del corrector se cierre automáticamente.
      suppressCorrectorClose = true
      editorEl.value =
        editorEl.value.slice(0, offset) +
        replacement +
        editorEl.value.slice(offset + length)
      editorEl.dispatchEvent(new Event('input'))

      // Marcamos la sugerencia como aplicada
      const card = replaceBtn.closest('.suggestion-card') as HTMLElement | null
      if (card) {
        card.classList.add('suggestion-applied')
        card.querySelectorAll('button').forEach(b => (b as HTMLButtonElement).setAttribute('disabled', ''))
        const hdr = card.querySelector('.suggestion-header')
        if (hdr && !hdr.querySelector('.suggestion-applied-tag')) {
          const tag = document.createElement('span')
          tag.className = 'suggestion-applied-tag'
          tag.textContent = ' Aplicado'
          hdr.appendChild(tag)
        }
      }

      // Re-ejecuta automáticamente el corrector y actualiza la lista manteniendo el panel abierto
      results.innerHTML = '<p class="corrector-loading">Revisando...</p>'
      const { suggestions: newSuggestions, error: newError } = await checkText(editorEl.value)

      if (newError) {
        results.innerHTML = `<p class="corrector-error">${newError}</p>`
        applyWordHighlights(editorEl.value)
        return
      }

      if (newSuggestions.length === 0) {
        results.innerHTML = '<p class="corrector-ok">✓ No se encontraron errores.</p>'
        applyErrorHighlights(editorEl.value, [])
        return
      }

      const normalized2 = [...newSuggestions].sort((a, b) => a.offset - b.offset || b.length - a.length)
      const nonOverlapping2: typeof normalized2 = []
      let lastEnd2 = -1
      for (const s of normalized2) {
        const end = s.offset + s.length
        if (s.offset < lastEnd2) continue
        nonOverlapping2.push(s)
        lastEnd2 = end
      }

      applyErrorHighlights(editorEl.value, nonOverlapping2.map(s => ({ offset: s.offset, length: s.length })))

      const remainingById2 = nonOverlapping2.map((s, i) => ({
        id: i,
        offset: s.offset,
        length: s.length,
        original: s.original,
        message: s.message,
        replacements: s.replacements,
      }))

      results.innerHTML = remainingById2.map((s) => `
        <div class="suggestion-card" data-sug-id="${s.id}">
          <div class="suggestion-header">
            <span class="suggestion-original">${escapeHtml(s.original)}</span>
            <span class="suggestion-message">${escapeHtml(s.message)}</span>
          </div>
          ${s.replacements.length > 0 ? `
            <div class="suggestion-replacements">
              ${s.replacements.map(r => `
                <button
                  class="suggestion-replace-btn"
                  data-offset="${s.offset}"
                  data-length="${s.length}"
                  data-original="${encodeURIComponent(s.original)}"
                  data-replacement="${encodeURIComponent(r)}"
                >${escapeHtml(r)}</button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')

      // Re-attach handlers for the new list
      results.querySelectorAll<HTMLButtonElement>('.suggestion-replace-btn').forEach(b => {
        b.addEventListener('click', () => handleReplace(b))
      })
    }

    // Attach initial handlers
    results.querySelectorAll<HTMLButtonElement>('.suggestion-replace-btn').forEach(b => {
      b.addEventListener('click', () => handleReplace(b))
    })
  })
}

// ─── Conectividad ─────────────────────────────────────────────────

function bindConnectivity(): void {
  const banner = document.getElementById('offline-banner')!

  function update(online: boolean): void {
    if (online) {
      banner.classList.add('hidden')
    } else {
      banner.classList.remove('hidden')
    }
  }

  // Estado inicial
  update(navigator.onLine)


  // Escucha cambios
  onConnectivityChange(update)
}