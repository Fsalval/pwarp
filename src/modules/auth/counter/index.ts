export interface CounterOptions {
    countHyphenated: boolean
    countContractions: boolean
    countAbbreviations: boolean
}

export const DEFAULT_OPTIONS: CounterOptions = {
    countHyphenated: true,
    countContractions: true,
    countAbbreviations: true,
}

const segmenter = new Intl.Segmenter('es', { granularity: 'word' })

const WORD_REGEX = /\p{L}/u

export function countWords(
    text: string,
    options: CounterOptions = DEFAULT_OPTIONS
    ): number {
    if (!text.trim()) return 0

    return [...segmenter.segment(text)].filter(seg => {
        if (!seg.isWordLike) return false
        const s = seg.segment
        if (/^\d+$/.test(s)) return false
        if (/^[\p{L}]+\.$/u.test(s)) return options.countAbbreviations
        if (s.includes("'") || s.includes('\u2019')) return options.countContractions
        if (s.includes('-')) return options.countHyphenated
        return WORD_REGEX.test(s)
    }).length
}