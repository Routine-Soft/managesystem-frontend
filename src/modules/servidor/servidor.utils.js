import { diasAte } from '@/i18n/formatar'

export const TOM_DO_STATUS = { online: 'success', lento: 'warning', offline: 'danger', aguardando: 'info' }

export function pct(parte, total) {
    if (!total || parte === null || parte === undefined) return null
    return (parte / total) * 100
}

// Cor da barra conforme o uso: até 75% normal, até 90% alto, acima disso crítico.
export function tomDoUso(valor) {
    if (valor === null || valor === undefined) return 'info'
    if (valor >= 90) return 'danger'
    if (valor >= 75) return 'warning'
    return 'success'
}

export function tomDosDias(dias) {
    if (dias === null) return 'info'
    if (dias <= 7) return 'danger'
    if (dias <= 30) return 'warning'
    return 'success'
}

export function hostDaUrl(url) {
    try {
        return new URL(url).hostname
    } catch {
        return url
    }
}

export function resumoDoSistema(sistema, t, formatarBytes, idioma) {
    if (!sistema?.so) return null
    return [sistema.so, sistema.cpus ? t('servidor.cpus', { n: sistema.cpus }) : null, sistema.ramTotal ? formatarBytes(sistema.ramTotal, idioma, 0) : null]
        .filter(Boolean)
        .join(' · ')
}

// Vencimentos dos próximos `limiteDias` dias: SSL dos servidores e dos sites, domínios e e-mails.
export function proximosVencimentos(servidores, sites, limiteDias = 60) {
    const itens = []
    const hostsComServidor = new Set()
    for (const s of servidores) {
        if (s.ssl?.expiraEm && s.url) {
            const host = hostDaUrl(s.url)
            hostsComServidor.add(host.replace(/^www\./, ''))
            itens.push({ chave: `ssl-${s._id}`, tipo: 'ssl', nome: host, data: s.ssl.expiraEm, link: `/servidores/${s._id}` })
        }
    }
    for (const site of sites) {
        if (site.ssl?.expiraEm && !hostsComServidor.has(site.dominio)) {
            itens.push({ chave: `ssl-site-${site._id}`, tipo: 'ssl', nome: site.dominio, data: site.ssl.expiraEm, link: '/sites' })
        }
        const dominio = site.manual?.expiraEm ?? site.registro?.expiraEm
        if (dominio) itens.push({ chave: `dom-${site._id}`, tipo: 'dominio', nome: site.dominio, data: dominio, link: '/sites' })
        if (site.emails?.vencimento) itens.push({ chave: `email-${site._id}`, tipo: 'emails', nome: site.dominio, data: site.emails.vencimento, link: '/sites' })
    }
    return itens
        .map((i) => ({ ...i, dias: diasAte(i.data) }))
        .filter((i) => i.dias <= limiteDias)
        .sort((a, b) => a.dias - b.dias)
}

export function contarPendenciasDeSeguranca(servidores) {
    return servidores.reduce((soma, s) => soma + (s.pendencias?.sistemaSeguranca ?? 0) + (s.pendencias?.dependenciasVulneraveis ?? 0), 0)
}

// Filtro das dependências por etiqueta.
export function filtrarDependencias(deps, filtro) {
    if (filtro === 'seguranca') return deps.filter((d) => d.vulneravel || d.categoria === 'seguranca')
    if (['maior', 'menor', 'correcao'].includes(filtro)) return deps.filter((d) => d.salto === filtro)
    return deps
}

export function minutosLegiveis(min) {
    if (!min) return '0 min'
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60)
    return min % 60 ? `${h}h ${min % 60}min` : `${h}h`
}

// Valor em outra moeda convertido para a moeda da conta (só para mostrar). null quando não precisa ou não há cotação.
export function convertido(valor, moeda, moedaPadrao, cotacoes) {
    if (valor === null || valor === undefined || !moeda || moeda === moedaPadrao) return null
    const taxa = cotacoes?.[moeda]
    return Number.isFinite(taxa) ? Number(valor) * taxa : null
}
