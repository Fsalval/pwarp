export type Platform =
    | 'facebook'
    | 'facebook_lite'
    | 'instagram'
    | 'twitter'
    | 'whatsapp'
    | 'tiktok'
    | 'vk'

export type CompatibilityStatus = 'supported' | 'partial' | 'unsupported'

export interface SymbolEntry {
    id: string
    symbol: string
    name: string
    category: string
    tags: string[]
    compatibility: Record<Platform, CompatibilityStatus>
}

    export type UnicodeStyle =
    // ── Matemáticos (offset) ──
    | 'bold'
    | 'italic'
    | 'boldItalic'
    | 'script'
    | 'boldScript'
    | 'fraktur'
    | 'boldFraktur'
    | 'doubleStruck'
    | 'monospace'
    | 'sansSerif'
    | 'sansSerifBold'
    | 'sansSerifItalic'
    | 'sansSerifBoldItalic'
    // ── Mapas especiales ──
    | 'boxed'
    | 'fullwidth'
    | 'circled'
    | 'circledNeg'
    | 'parenthesized'
    | 'smallCaps'
    | 'superscript'
    | 'subscript'
    | 'strikethrough'
    | 'underline'
    | 'doubleUnderline'
    | 'slashed'
    | 'inverted'
    | 'mirrored'
    | 'medieval'
    | 'oldEnglish'
    | 'curvy1'
    | 'curvy2'
    | 'weirdCaps'
    | 'tinyText'
    | 'filledBox'
    | 'newspaper'

export interface StyleDefinition {
    label: string
    upperBase: number
    lowerBase: number
}

export interface Template {
  id: string
  user_id: string
  name: string
  type: 'header' | 'separator' | 'character_sheet' | 'dialogue' | 'custom'
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  username?: string 
}