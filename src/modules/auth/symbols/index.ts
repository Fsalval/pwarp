import type { SymbolEntry, Platform, CompatibilityStatus } from '../../../types/index'

export type { Platform, CompatibilityStatus }

    export interface SymbolFilter {
    category?: string
    platform?: Platform
    query?: string
    }

    let cache: SymbolEntry[] | null = null

    async function load(): Promise<SymbolEntry[]> {
    if (cache) return cache
    const mod = await import('./symbols.json')
    cache = mod.default as SymbolEntry[]
    return cache
    }

    export async function getCategories(): Promise<string[]> {
    const symbols = await load()
    return [...new Set(symbols.map(s => s.category))]
    }

    export async function filterSymbols(filter: SymbolFilter): Promise<SymbolEntry[]> {
    const symbols = await load()

    return symbols.filter(entry => {
        if (filter.category && entry.category !== filter.category) return false

        if (filter.platform) {
        if (entry.compatibility[filter.platform] === 'unsupported') return false
        }

        if (filter.query) {
        const q = filter.query.toLowerCase()
        const match =
            entry.name.toLowerCase().includes(q) ||
            entry.tags.some(t => t.toLowerCase().includes(q)) ||
            entry.symbol.includes(q)
        if (!match) return false
        }

        return true
    })
}