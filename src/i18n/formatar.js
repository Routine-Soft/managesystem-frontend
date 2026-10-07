import { LOCALE } from './idioma'

// Formatação de números, datas e tamanhos conforme o idioma.

export function formatarBytes(bytes, idioma, casas = 1) {
    if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) return '—'
    const unidades = ['B', 'KB', 'MB', 'GB', 'TB']
    let valor = Number(bytes)
    let i = 0
    while (valor >= 1024 && i < unidades.length - 1) {
        valor /= 1024
        i++
    }
    return `${valor.toLocaleString(LOCALE[idioma], { maximumFractionDigits: i >= 3 ? casas : 0 })} ${unidades[i]}`
}

export function formatarNumero(valor, idioma, casas = 0) {
    if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '—'
    return Number(valor).toLocaleString(LOCALE[idioma], { maximumFractionDigits: casas, minimumFractionDigits: casas })
}

export function formatarPct(valor, idioma, casas = 0) {
    if (valor === null || valor === undefined) return '—'
    return `${formatarNumero(valor, idioma, casas)}%`
}

export function formatarData(data, idioma, opcoes = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
    if (!data) return '—'
    return new Date(data).toLocaleDateString(LOCALE[idioma], opcoes)
}

export function formatarDataHora(data, idioma) {
    if (!data) return '—'
    return new Date(data).toLocaleString(LOCALE[idioma], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function formatarHora(data, idioma) {
    if (!data) return '—'
    return new Date(data).toLocaleTimeString(LOCALE[idioma], { hour: '2-digit', minute: '2-digit' })
}

export function formatarMoeda(valor, moeda, idioma) {
    if (valor === null || valor === undefined) return '—'
    return Number(valor).toLocaleString(LOCALE[idioma], { style: 'currency', currency: moeda || 'BRL' })
}

// "há 12 segundos", "há 3 min", "2 days ago"...
export function formatarRelativo(data, idioma, agora = Date.now()) {
    if (!data) return '—'
    const segundos = Math.round((new Date(data).getTime() - agora) / 1000)
    const rtf = new Intl.RelativeTimeFormat(LOCALE[idioma], { numeric: 'auto' })
    const abs = Math.abs(segundos)
    if (abs < 60) return rtf.format(segundos, 'second')
    if (abs < 3600) return rtf.format(Math.round(segundos / 60), 'minute')
    if (abs < 86400) return rtf.format(Math.round(segundos / 3600), 'hour')
    return rtf.format(Math.round(segundos / 86400), 'day')
}

// Tempo no ar: "47d 12h 33m".
export function formatarDuracao(ms) {
    if (!ms || ms < 0) return '—'
    const minutos = Math.floor(ms / 60000)
    const d = Math.floor(minutos / 1440)
    const h = Math.floor((minutos % 1440) / 60)
    const m = minutos % 60
    return d ? `${d}d ${h}h ${m}m` : h ? `${h}h ${m}m` : `${m}m`
}

export function diasAte(data, agora = Date.now()) {
    if (!data) return null
    return Math.ceil((new Date(data).getTime() - agora) / 86400000)
}
