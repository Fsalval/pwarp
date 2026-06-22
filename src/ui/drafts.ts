// Draft Management System
interface Draft {
  text: string
  savedAt: number
  preview: string
}

function loadDrafts(): Draft[] {
  const drafts: Draft[] = []
  for (let i = 0; i < 5; i++) {
    const key = `rpw_draft_${i}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        drafts[i] = JSON.parse(stored)
      } catch {
        drafts[i] = { text: '', savedAt: 0, preview: '' }
      }
    } else {
      drafts[i] = { text: '', savedAt: 0, preview: '' }
    }
  }
  return drafts
}

function saveDraft(index: number, text: string): void {
  if (index < 0 || index >= 5) return
  const preview = text.substring(0, 50) + (text.length > 50 ? '...' : '')
  const draft: Draft = {
    text,
    savedAt: Date.now(),
    preview
  }
  localStorage.setItem(`rpw_draft_${index}`, JSON.stringify(draft))
}

function loadDraft(index: number): string {
  if (index < 0 || index >= 5) return ''
  const key = `rpw_draft_${index}`
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      const draft: Draft = JSON.parse(stored)
      return draft.text
    } catch {
      return ''
    }
  }
  return ''
}

function deleteDraft(index: number): void {
  if (index < 0 || index >= 5) return
  localStorage.removeItem(`rpw_draft_${index}`)
}

function renderDraftsList(): void {
  const list = document.getElementById('drafts-list')
  if (!list) return

  const drafts = loadDrafts()
  list.innerHTML = drafts
    .map(
      (draft, i) => `
    <div class="drafts-item">
      <span class="drafts-item-num">#${i + 1}</span>
      <div class="drafts-item-preview">${draft.preview || '(vacío)'}</div>
      <div class="drafts-item-actions">
        <button type="button" class="sym-copy-btn" data-load-draft="${i}" title="Cargar">📥</button>
        <button type="button" class="sym-copy-btn" data-copy-draft="${i}" title="Copiar">📋</button>
        <button type="button" class="sym-clear-btn" data-delete-draft="${i}" title="Eliminar">🗑️</button>
      </div>
    </div>
  `
    )
    .join('')

  attachDraftActions()
}

function renderDraftsModal(): void {
  const slots = document.getElementById('drafts-modal-slots')
  if (!slots) return

  const editor = document.getElementById('main-editor') as HTMLTextAreaElement
  const text = editor?.value || ''

  slots.innerHTML = Array.from({ length: 5 })
    .map(
      (_, i) => `
    <button type="button" class="drafts-slot" data-save-slot="${i}">
      <span class="slot-num">#${i + 1}</span>
      <span class="slot-action">Guardar aquí</span>
    </button>
  `
    )
    .join('')

  slots.querySelectorAll('[data-save-slot]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slot = parseInt((btn as HTMLElement).getAttribute('data-save-slot') || '0')
      saveDraft(slot, text)
      const modal = document.getElementById('drafts-modal')
      if (modal) modal.classList.add('hidden')
      renderDraftsList()
    })
  })
}

function attachDraftActions(): void {
  const list = document.getElementById('drafts-list')
  if (!list) return

  list.querySelectorAll('[data-load-draft]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt((btn as HTMLElement).getAttribute('data-load-draft') || '0')
      const text = loadDraft(index)
      const editor = document.getElementById('main-editor') as HTMLTextAreaElement
      if (editor) {
        editor.value = text
        editor.dispatchEvent(new Event('input'))
      }
    })
  })

  list.querySelectorAll('[data-copy-draft]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt((btn as HTMLElement).getAttribute('data-copy-draft') || '0')
      const text = loadDraft(index)
      navigator.clipboard.writeText(text)
    })
  })

  list.querySelectorAll('[data-delete-draft]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt((btn as HTMLElement).getAttribute('data-delete-draft') || '0')
      deleteDraft(index)
      renderDraftsList()
    })
  })
}

export function bindBorradores(): void {
  renderDraftsList()

  const btnOpen = document.getElementById('btn-open-drafts-modal')
  const btnClose = document.getElementById('btn-close-drafts-modal')
  const modal = document.getElementById('drafts-modal')

  btnOpen?.addEventListener('click', () => {
    renderDraftsModal()
    modal?.classList.remove('hidden')
  })

  btnClose?.addEventListener('click', () => {
    modal?.classList.add('hidden')
  })

  modal?.querySelector('.drafts-overlay')?.addEventListener('click', () => {
    modal.classList.add('hidden')
  })
}
