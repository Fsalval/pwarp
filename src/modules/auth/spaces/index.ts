import type { Platform } from '../../../types/index'

// ─── Corregir espacios por plataforma ──────────────────────────────

export function fixSpaces(text: string, platform: Platform): string {
  if (platform === 'facebook' || platform === 'instagram' || platform === 'vk') {
    // Alterna \u00A0 (NBSP) y \u0020 (espacio normal) en espacios múltiples
    return text.replace(/ {2,}/g, (match) => {
      return Array.from(match)
        .map((_, i) => (i % 2 === 0 ? '\u00A0' : '\u0020'))
        .join('')
    })
  }

  if (platform === 'whatsapp') {
    // Usa \u2800 (Braille blank pattern) para espacios múltiples
    return text.replace(/ {2,}/g, (match) => '\u2800'.repeat(match.length))
  }

  if (platform === 'twitter' || platform === 'tiktok') {
    // Usa \u200B (Zero-width space) para mantener espacios sin truncar
    return text.replace(/ {2,}/g, (match) => '\u200B'.repeat(match.length))
  }

  return text
}

// ─── Guía de espacios por plataforma ───────────────────────────────

export function getSpaceGuide(platform: Platform): string[] {
  const guides: Record<Platform, string[]> = {
    facebook: [
      '• Alterna espacios normales y NBSP',
      '• Máximo 477 caracteres para preview',
      '• Ideal para separadores visuales',
    ],
    facebook_lite: [
      '• Menos soporte para caracteres especiales',
      '• Usa espacios normales',
    ],
    instagram: [
      '• Alterna espacios normales y NBSP',
      '• Máximo 3 líneas en vista previa',
      '• 320px ancho en móvil',
    ],
    twitter: [
      '• Usa espacios de ancho cero',
      '• Contador de 280 caracteres',
      '• Se vuelven rojo si excede límite',
    ],
    whatsapp: [
      '• Usa caracteres Braille para espacios',
      '• Sin truncado: monospace',
      '• Ideal para filas alineadas',
    ],
    tiktok: [
      '• Usa espacios de ancho cero',
      '• Trunca después de 80 caracteres',
      '• Altura 400px en móvil',
    ],
    vk: [
      '• Alterna espacios normales y NBSP',
      '• Sin truncado: 320px ancho',
      '• Soporta Unicode completo',
    ],
  }

  return guides[platform] ?? []
}
