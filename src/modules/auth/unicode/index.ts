import type { UnicodeStyle } from '../../../types/index'

export type { UnicodeStyle }

// Exportado para que la UI pueda mostrar labels y mapear estilos
export { STYLES }


// ─── Tipos internos ───────────────────────────────────────────────

interface OffsetStyle {
    kind: 'offset'
    label: string
    upperBase: number
    lowerBase: number
}

interface MapStyle {
    kind: 'map'
    label: string
    transform: (text: string) => string
}

type StyleEntry = OffsetStyle | MapStyle

// ─── Tabla de estilos ─────────────────────────────────────────────

const STYLES: Record<UnicodeStyle, StyleEntry> = {

  // Offset: matemáticos
    bold:                { kind: 'offset', label: 'Negrita',              upperBase: 0x1D400, lowerBase: 0x1D41A },
    italic:              { kind: 'offset', label: 'Cursiva',              upperBase: 0x1D434, lowerBase: 0x1D44E },
    boldItalic:          { kind: 'offset', label: 'Negrita cursiva',      upperBase: 0x1D468, lowerBase: 0x1D482 },
    script:              { kind: 'offset', label: 'Script',               upperBase: 0x1D49C, lowerBase: 0x1D4B6 },
    boldScript:          { kind: 'offset', label: 'Script negrita',       upperBase: 0x1D4D0, lowerBase: 0x1D4EA },
    fraktur:             { kind: 'offset', label: 'Fraktur',              upperBase: 0x1D504, lowerBase: 0x1D51E },
    boldFraktur:         { kind: 'offset', label: 'Fraktur negrita',      upperBase: 0x1D56C, lowerBase: 0x1D586 },
    doubleStruck:        { kind: 'offset', label: 'Doble trazo',          upperBase: 0x1D538, lowerBase: 0x1D552 },
    monospace:           { kind: 'offset', label: 'Monoespaciado',        upperBase: 0x1D670, lowerBase: 0x1D68A },
    sansSerif:           { kind: 'offset', label: 'Sans-serif',           upperBase: 0x1D5A0, lowerBase: 0x1D5BA },
    sansSerifBold:       { kind: 'offset', label: 'Sans-serif negrita',   upperBase: 0x1D5D4, lowerBase: 0x1D5EE },
    sansSerifItalic:     { kind: 'offset', label: 'Sans-serif cursiva',   upperBase: 0x1D608, lowerBase: 0x1D622 },
    sansSerifBoldItalic: { kind: 'offset', label: 'Sans-serif neg. cur.', upperBase: 0x1D63C, lowerBase: 0x1D656 },

    // Mapa: resto de estilos
    fullwidth: {
        kind: 'map', label: 'Ancho completo',
        transform: (t) => [...t].map(c => {
        const code = c.charCodeAt(0)
        if (code >= 33 && code <= 126) return String.fromCodePoint(code + 0xFEE0)
        if (c === ' ') return '\u3000'
        return c
        }).join(''),
    },

    boxed: {
        kind: 'map', label: 'Enmarcado',
        transform: (t) => [...t].map(c => c === ' ' ? ' ' : `【${c}】`).join(''),
    },

    circled: {
        kind: 'map', label: 'Con círculo',
        transform: makeMapTransform({
        'A':'Ⓐ','B':'Ⓑ','C':'Ⓒ','D':'Ⓓ','E':'Ⓔ','F':'Ⓕ','G':'Ⓖ','H':'Ⓗ','I':'Ⓘ','J':'Ⓙ',
        'K':'Ⓚ','L':'Ⓛ','M':'Ⓜ','N':'Ⓝ','O':'Ⓞ','P':'Ⓟ','Q':'Ⓠ','R':'Ⓡ','S':'Ⓢ','T':'Ⓣ',
        'U':'Ⓤ','V':'Ⓥ','W':'Ⓦ','X':'Ⓧ','Y':'Ⓨ','Z':'Ⓩ',
        'a':'ⓐ','b':'ⓑ','c':'ⓒ','d':'ⓓ','e':'ⓔ','f':'ⓕ','g':'ⓖ','h':'ⓗ','i':'ⓘ','j':'ⓙ',
        'k':'ⓚ','l':'ⓛ','m':'ⓜ','n':'ⓝ','o':'ⓞ','p':'ⓟ','q':'ⓠ','r':'ⓡ','s':'ⓢ','t':'ⓣ',
        'u':'ⓤ','v':'ⓥ','w':'ⓦ','x':'ⓧ','y':'ⓨ','z':'ⓩ',
        '0':'⓪','1':'①','2':'②','3':'③','4':'④','5':'⑤','6':'⑥','7':'⑦','8':'⑧','9':'⑨',
        }),
    },

    circledNeg: {
        kind: 'map', label: 'Círculo relleno',
        transform: makeMapTransform({
        'A':'🅐','B':'🅑','C':'🅒','D':'🅓','E':'🅔','F':'🅕','G':'🅖','H':'🅗','I':'🅘','J':'🅙',
        'K':'🅚','L':'🅛','M':'🅜','N':'🅝','O':'🅞','P':'🅟','Q':'🅠','R':'🅡','S':'🅢','T':'🅣',
        'U':'🅤','V':'🅥','W':'🅦','X':'🅧','Y':'🅨','Z':'🅩',
        'a':'🅐','b':'🅑','c':'🅒','d':'🅓','e':'🅔','f':'🅕','g':'🅖','h':'🅗','i':'🅘','j':'🅙',
        'k':'🅚','l':'🅛','m':'🅜','n':'🅝','o':'🅞','p':'🅟','q':'🅠','r':'🅡','s':'🅢','t':'🅣',
        'u':'🅤','v':'🅥','w':'🅦','x':'🅧','y':'🅨','z':'🅩',
        }),
    },

    parenthesized: {
        kind: 'map', label: 'Paréntesis',
        transform: makeMapTransform({
        'a':'⒜','b':'⒝','c':'⒞','d':'⒟','e':'⒠','f':'⒡','g':'⒢','h':'⒣','i':'⒤','j':'⒥',
        'k':'⒦','l':'⒧','m':'⒨','n':'⒩','o':'⒪','p':'⒫','q':'⒬','r':'⒭','s':'⒮','t':'⒯',
        'u':'⒰','v':'⒱','w':'⒲','x':'⒳','y':'⒴','z':'⒵',
        'A':'⒜','B':'⒝','C':'⒞','D':'⒟','E':'⒠','F':'⒡','G':'⒢','H':'⒣','I':'⒤','J':'⒥',
        'K':'⒦','L':'⒧','M':'⒨','N':'⒩','O':'⒪','P':'⒫','Q':'⒬','R':'⒭','S':'⒮','T':'⒯',
        'U':'⒰','V':'⒱','W':'⒲','X':'⒳','Y':'⒴','Z':'⒵',
        '1':'⑴','2':'⑵','3':'⑶','4':'⑷','5':'⑸','6':'⑹','7':'⑺','8':'⑻','9':'⑼','0':'⑽',
        }),
    },

    smallCaps: {
        kind: 'map', label: 'Versalitas',
        transform: makeMapTransform({
        'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ',
        'k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ',
        'u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ',
        'A':'ᴀ','B':'ʙ','C':'ᴄ','D':'ᴅ','E':'ᴇ','F':'ꜰ','G':'ɢ','H':'ʜ','I':'ɪ','J':'ᴊ',
        'K':'ᴋ','L':'ʟ','M':'ᴍ','N':'ɴ','O':'ᴏ','P':'ᴘ','Q':'ǫ','R':'ʀ','S':'ꜱ','T':'ᴛ',
        'U':'ᴜ','V':'ᴠ','W':'ᴡ','X':'x','Y':'ʏ','Z':'ᴢ',
        }),
    },

    superscript: {
        kind: 'map', label: 'Superíndice',
        transform: makeMapTransform({
        'a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ',
        'k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','q':'ᵠ','r':'ʳ','s':'ˢ','t':'ᵗ',
        'u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ',
        'A':'ᴬ','B':'ᴮ','C':'ᶜ','D':'ᴰ','E':'ᴱ','F':'ᶠ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ',
        'K':'ᴷ','L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','Q':'Q','R':'ᴿ','S':'ˢ','T':'ᵀ',
        'U':'ᵁ','V':'ᵛ','W':'ᵂ','X':'ˣ','Y':'ʸ','Z':'ᶻ',
        '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
        }),
    },

    subscript: {
        kind: 'map', label: 'Subíndice',
        transform: makeMapTransform({
        'a':'ₐ','b':'b','c':'c','d':'d','e':'ₑ','f':'f','g':'g','h':'ₕ','i':'ᵢ','j':'ⱼ',
        'k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ','q':'q','r':'ᵣ','s':'ₛ','t':'ₜ',
        'u':'ᵤ','v':'ᵥ','w':'w','x':'ₓ','y':'y','z':'z',
        'A':'ₐ','B':'B','C':'C','D':'D','E':'ₑ','F':'F','G':'G','H':'ₕ','I':'ᵢ','J':'ⱼ',
        'K':'ₖ','L':'ₗ','M':'ₘ','N':'ₙ','O':'ₒ','P':'ₚ','Q':'Q','R':'ᵣ','S':'ₛ','T':'ₜ',
        'U':'ᵤ','V':'ᵥ','W':'W','X':'ₓ','Y':'Y','Z':'Z',
        '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
        }),
    },

    strikethrough: {
        kind: 'map', label: 'Tachado',
        transform: (t) => [...t].map(c => c + '\u0336').join(''),
    },

    underline: {
        kind: 'map', label: 'Subrayado',
        transform: (t) => [...t].map(c => c + '\u0332').join(''),
    },

    doubleUnderline: {
        kind: 'map', label: 'Doble subrayado',
        transform: (t) => [...t].map(c => c + '\u0333').join(''),
    },

    slashed: {
        kind: 'map', label: 'Tachado diagonal',
        transform: (t) => [...t].map(c => c + '\u0338').join(''),
    },

    inverted: {
        kind: 'map', label: 'Invertido',
        transform: makeMapTransform({
        'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ᴉ','j':'ɾ',
        'k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ',
        'u':'n','v':'ʌ','w':'ʍ','x':'x','y':'ʎ','z':'z',
        'A':'∀','B':'B','C':'Ɔ','D':'D','E':'Ǝ','F':'Ⅎ','G':'פ','H':'H','I':'I','J':'ɾ',
        'K':'K','L':'˥','M':'W','N':'N','O':'O','P':'Ԁ','Q':'Q','R':'R','S':'S','T':'┴',
        'U':'∩','V':'Λ','W':'M','X':'X','Y':'⅄','Z':'Z',
        '1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ᔭ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6','0':'0',
        '?':'¿','!':'¡','.':'˙',',':'\'',
        }),
    },

    mirrored: {
        kind: 'map', label: 'Espejo',
        transform: makeMapTransform({
        'a':'ɒ','b':'d','c':'ɔ','d':'b','e':'ɘ','f':'ʇ','g':'ϱ','h':'ʜ','i':'i','j':'ᴊ',
        'k':'ʞ','l':'l','m':'m','n':'ᴎ','o':'o','p':'q','q':'p','r':'ɿ','s':'ƨ','t':'ƚ',
        'u':'u','v':'v','w':'w','x':'x','y':'y','z':'ƹ',
        'A':'A','B':'ᗺ','C':'Ɔ','D':'ᗡ','E':'Ǝ','F':'ᖵ','G':'Ɔ','H':'H','I':'I','J':'Ⴑ',
        'K':'ᴋ','L':'⅃','M':'M','N':'И','O':'O','P':'ᑫ','Q':'Ϙ','R':'Я','S':'Ƨ','T':'T',
        'U':'U','V':'V','W':'W','X':'X','Y':'Y','Z':'Ƹ',
        }),
    },

    medieval: {
        kind: 'map', label: 'Medieval',
        transform: makeMapTransform({
        'a':'𝖆','b':'𝖇','c':'𝖈','d':'𝖉','e':'𝖊','f':'𝖋','g':'𝖌','h':'𝖍','i':'𝖎','j':'𝖏',
        'k':'𝖐','l':'𝖑','m':'𝖒','n':'𝖓','o':'𝖔','p':'𝖕','q':'𝖖','r':'𝖗','s':'𝖘','t':'𝖙',
        'u':'𝖚','v':'𝖛','w':'𝖜','x':'𝖝','y':'𝖞','z':'𝖟',
        'A':'𝕬','B':'𝕭','C':'𝕮','D':'𝕯','E':'𝕰','F':'𝕱','G':'𝕲','H':'𝕳','I':'𝕴','J':'𝕵',
        'K':'𝕶','L':'𝕷','M':'𝕸','N':'𝕹','O':'𝕺','P':'𝕻','Q':'𝕼','R':'𝕽','S':'𝕾','T':'𝕿',
        'U':'𝖀','V':'𝖁','W':'𝖂','X':'𝖃','Y':'𝖄','Z':'𝖅',
        }),
    },

    oldEnglish: {
        kind: 'map', label: 'Inglés antiguo',
        transform: makeMapTransform({
        'a':'𝔞','b':'𝔟','c':'𝔠','d':'𝔡','e':'𝔢','f':'𝔣','g':'𝔤','h':'𝔥','i':'𝔦','j':'𝔧',
        'k':'𝔨','l':'𝔩','m':'𝔪','n':'𝔫','o':'𝔬','p':'𝔭','q':'𝔮','r':'𝔯','s':'𝔰','t':'𝔱',
        'u':'𝔲','v':'𝔳','w':'𝔴','x':'𝔵','y':'𝔶','z':'𝔷',
        'A':'𝔄','B':'𝔅','C':'ℭ','D':'𝔇','E':'𝔈','F':'𝔉','G':'𝔊','H':'ℌ','I':'ℑ','J':'𝔍',
        'K':'𝔎','L':'𝔏','M':'𝔐','N':'𝔑','O':'𝔒','P':'𝔓','Q':'𝔔','R':'ℜ','S':'𝔖','T':'𝔗',
        'U':'𝔘','V':'𝔙','W':'𝔚','X':'𝔛','Y':'𝔜','Z':'ℨ',
        }),
    },

    curvy1: {
        kind: 'map', label: 'Cursivo 1',
        transform: makeMapTransform({
        'a':'α','b':'в','c':'¢','d':'∂','e':'є','f':'ƒ','g':'g','h':'н','i':'ι','j':'נ',
        'k':'к','l':'ℓ','m':'м','n':'η','o':'σ','p':'ρ','q':'q','r':'я','s':'ѕ','t':'т',
        'u':'υ','v':'ν','w':'ω','x':'χ','y':'у','z':'z',
        'A':'α','B':'в','C':'¢','D':'∂','E':'є','F':'ƒ','G':'G','H':'н','I':'ι','J':'נ',
        'K':'к','L':'ℓ','M':'м','N':'η','O':'σ','P':'ρ','Q':'Q','R':'я','S':'ѕ','T':'т',
        'U':'υ','V':'ν','W':'ω','X':'χ','Y':'у','Z':'Z',
        }),
    },

    curvy2: {
        kind: 'map', label: 'Cursivo 2',
        transform: makeMapTransform({
        'a':'а','b':'Ƅ','c':'ϲ','d':'ԁ','e':'е','f':'f','g':'ɡ','h':'һ','i':'і','j':'ϳ',
        'k':'k','l':'ⅼ','m':'m','n':'n','o':'о','p':'р','q':'q','r':'r','s':'ѕ','t':'t',
        'u':'u','v':'v','w':'w','x':'х','y':'у','z':'z',
        'A':'А','B':'В','C':'С','D':'D','E':'Е','F':'F','G':'G','H':'Н','I':'І','J':'J',
        'K':'K','L':'L','M':'М','N':'N','O':'О','P':'Р','Q':'Q','R':'R','S':'S','T':'Т',
        'U':'U','V':'V','W':'W','X':'Х','Y':'У','Z':'Z',
        }),
    },

    weirdCaps: {
        kind: 'map', label: 'Alternado',
        transform: (t) => [...t].map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join(''),
    },

    tinyText: {
        kind: 'map', label: 'Texto pequeño',
        transform: makeMapTransform({
        'a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ',
        'k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','q':'q','r':'ʳ','s':'ˢ','t':'ᵗ',
        'u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ',
        'A':'ᴬ','B':'ᴮ','C':'ᶜ','D':'ᴰ','E':'ᴱ','F':'ᶠ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ',
        'K':'ᴷ','L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','Q':'Q','R':'ᴿ','S':'ˢ','T':'ᵀ',
        'U':'ᵁ','V':'ᵛ','W':'ᵂ','X':'ˣ','Y':'ʸ','Z':'ᶻ',
        }),
    },

    filledBox: {
        kind: 'map', label: 'Caja rellena',
        transform: makeMapTransform({
        'A':'🅐','B':'🅑','C':'🅒','D':'🅓','E':'🅔','F':'🅕','G':'🅖','H':'🅗','I':'🅘','J':'🅙',
        'K':'🅚','L':'🅛','M':'🅜','N':'🅝','O':'🅞','P':'🅟','Q':'🅠','R':'🅡','S':'🅢','T':'🅣',
        'U':'🅤','V':'🅥','W':'🅦','X':'🅧','Y':'🅨','Z':'🅩',
        'a':'🅐','b':'🅑','c':'🅒','d':'🅓','e':'🅔','f':'🅕','g':'🅖','h':'🅗','i':'🅘','j':'🅙',
        'k':'🅚','l':'🅛','m':'🅜','n':'🅝','o':'🅞','p':'🅟','q':'🅠','r':'🅡','s':'🅢','t':'🅣',
        'u':'🅤','v':'🅥','w':'🅦','x':'🅧','y':'🅨','z':'🅩',
        }),
    },

    newspaper: {
        kind: 'map', label: 'Recorte periódico',
        transform: (t) => [...t].map((c, i) => {
        if (c === ' ') return ' '
        return i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
        }).join('').split('').map(c => {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const lower = 'abcdefghijklmnopqrstuvwxyz'
        if (upper.includes(c)) return ['𝗔','𝗕','𝗖','𝗗','𝗘','𝗙','𝗚','𝗛','𝗜','𝗝','𝗞','𝗟','𝗠','𝗡','𝗢','𝗣','𝗤','𝗥','𝗦','𝗧','𝗨','𝗩','𝗪','𝗫','𝗬','𝗭'][upper.indexOf(c)]
        if (lower.includes(c)) return ['𝘢','𝘣','𝘤','𝘥','𝘦','𝘧','𝘨','𝘩','𝘪','𝘫','𝘬','𝘭','𝘮','𝘯','𝘰','𝘱','𝘲','𝘳','𝘴','𝘵','𝘶','𝘷','𝘸','𝘹','𝘺','𝘻'][lower.indexOf(c)]
        return c
        }).join(''),
    },
}

// ─── Helper: convierte un mapa de caracteres en función transform ──

function makeMapTransform(map: Record<string, string>): (text: string) => string {
    return (text: string) => [...text].map(c => map[c] ?? c).join('')
}

// ─── Función de conversión por offset ────────────────────────────

function convertOffset(text: string, style: OffsetStyle): string {
    return [...text].map(c => {
        const code = c.charCodeAt(0)
        if (code >= 65 && code <= 90) return String.fromCodePoint(style.upperBase + (code - 65))
        if (code >= 97 && code <= 122) return String.fromCodePoint(style.lowerBase + (code - 97))
        return c
    }).join('')
}

// ─── API pública ──────────────────────────────────────────────────

export function convertToStyle(text: string, styleName: UnicodeStyle): string {
    const style = STYLES[styleName]
    if (style.kind === 'offset') return convertOffset(text, style)
    return style.transform(text)
}

export function getAllPreviews(text: string): Array<{
    style: UnicodeStyle
    label: string
    result: string
    }> {
    return (Object.keys(STYLES) as UnicodeStyle[]).map(style => ({
        style,
        label: STYLES[style].label,
        result: convertToStyle(text, style),
    }))
}