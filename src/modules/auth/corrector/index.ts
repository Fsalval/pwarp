export interface Suggestion {
  message: string        // descripción del error
  offset: number         // posición donde empieza el error en el texto
  length: number         // largo del fragmento con error
  original: string       // el texto con error
  replacements: string[] // sugerencias de corrección
  ruleId: string         // identificador de la regla que se violó
}

export interface CorrectorResult {
  suggestions: Suggestion[]
  error: string | null
}

// Endpoint público de LanguageTool — no requiere API key
const API_URL = 'https://api.languagetoolplus.com/v2/check'

export async function checkText(
  text: string,
  language = 'es'
): Promise<CorrectorResult> {
  if (!text.trim()) {
    return { suggestions: [], error: null }
  }

  try {
    const body = new URLSearchParams({
      text,
      language,
      disabledRules: 'WHITESPACE_RULE', // ignora espacios dobles, muy ruidoso
    })

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!response.ok) {
      return { suggestions: [], error: `Error del servidor: ${response.status}` }
    }

    const data = await response.json() as {
      matches: Array<{
        message: string
        offset: number
        length: number
        replacements: Array<{ value: string }>
        rule: { id: string }
      }>
    }

    const suggestions: Suggestion[] = data.matches.map(match => ({
      message: match.message,
      offset: match.offset,
      length: match.length,
      original: text.slice(match.offset, match.offset + match.length),
      replacements: match.replacements.slice(0, 5).map(r => r.value),
      ruleId: match.rule.id,
    }))

    return { suggestions, error: null }

  } catch (err) {
    return {
      suggestions: [],
      error: 'No se pudo conectar con el corrector. Verifica tu conexión.',
    }
  }
}