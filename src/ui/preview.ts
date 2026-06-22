import { fixSpaces } from '../../pwa-roleplay-writer/src/modules/spaces/index'
import type { Platform } from '../types/index'

interface PlatformDimensions {
  width: number
  height: number
  maxChars: number
  maxLines: number
}

const PLATFORM_DIMENSIONS: Record<Platform, PlatformDimensions> = {
  facebook: { width: 328, height: 470, maxChars: 477, maxLines: Infinity },
  facebook_lite: { width: 328, height: 470, maxChars: 477, maxLines: Infinity },
  instagram: { width: 320, height: 470, maxChars: 477, maxLines: 3 },
  twitter: { width: 290, height: 510, maxChars: 280, maxLines: Infinity },
  whatsapp: { width: 300, height: 360, maxChars: Infinity, maxLines: Infinity },
  tiktok: { width: 320, height: 400, maxChars: 80, maxLines: 1 },
  vk: { width: 320, height: 510, maxChars: 477, maxLines: Infinity }
}

function getPlatformDimensions(platform: Platform): PlatformDimensions {
  return PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS.instagram
}

function truncateForPlatform(text: string, platform: Platform): string {
  const { maxChars, maxLines } = getPlatformDimensions(platform)

  let result = text
  if (maxChars !== Infinity && result.length > maxChars) {
    result = result.substring(0, maxChars) + '...'
  }

  if (maxLines !== Infinity) {
    const lines = result.split('\n')
    if (lines.length > maxLines) {
      result = lines.slice(0, maxLines).join('\n') + '...'
    }
  }

  return result
}

function renderPreviewBox(text: string, platform: Platform, isDesktop: boolean): string {
  const dims = getPlatformDimensions(platform)
  const truncated = truncateForPlatform(text, platform)
  const processedText = fixSpaces(truncated, platform)

  const width = isDesktop ? dims.width * 1.5 : dims.width
  const height = isDesktop ? dims.height * 1.5 : dims.height

  return `
    <div class="vista-previa-box" style="width: ${width}px; height: ${height}px;">
      <div class="vista-previa-content">
        ${processedText.split('\n').map((line) => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('')}
      </div>
    </div>
  `
}

export function bindVistaPrevia(): void {
  const container = document.getElementById('vista-previa-container')
  if (!container) return

  // TS: ensure type is non-null after the guard
  const safeContainer = container as HTMLElement


  let currentPlatform: Platform = 'instagram'
  let isDesktop = false

  // Create platform buttons
  const buttonsContainer = document.getElementById('platform-preview-buttons')
  if (buttonsContainer) {
    const platforms: Platform[] = ['facebook', 'instagram', 'whatsapp', 'twitter', 'tiktok', 'vk']
    buttonsContainer.innerHTML = platforms
      .map(
        (p) => `
      <button type="button" class="plat-btn ${p === 'instagram' ? 'active' : ''}" data-platform="${p}">
        ${p.charAt(0).toUpperCase() + p.slice(1)}
      </button>
    `
      )
      .join('')

    buttonsContainer.querySelectorAll('[data-platform]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentPlatform = (btn as HTMLElement).getAttribute('data-platform') as Platform
        buttonsContainer.querySelectorAll('[data-platform]').forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        updatePreview()
      })
    })
  }

  // Toggle view
  const toggleBtn = document.getElementById('btn-toggle-view')
  toggleBtn?.addEventListener('click', () => {
    isDesktop = !isDesktop
    toggleBtn.textContent = isDesktop ? '🖥️ Desktop' : '📱 Móvil'
    updatePreview()
  })

  function updatePreview() {
    const editor = document.getElementById('main-editor') as HTMLTextAreaElement
    const text = editor?.value || ''
    safeContainer.innerHTML = renderPreviewBox(text, currentPlatform, isDesktop)

    const copyBtn = safeContainer.querySelector('.vista-previa-copy-btn') as HTMLButtonElement

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const truncated = truncateForPlatform(text, currentPlatform)
        const processed = fixSpaces(truncated, currentPlatform)
        navigator.clipboard.writeText(processed)
      })
    }
  }

  // Listen to editor changes
  const editor = document.getElementById('main-editor') as HTMLTextAreaElement
  editor?.addEventListener('input', updatePreview)
    updatePreview()
  }
