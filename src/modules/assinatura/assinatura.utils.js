import { diasAte } from '@/i18n/formatar'

// Os planos têm preço só em dólar. No Pix (Brasil), o valor em reais sai pela cotação do dia.
export function precoEmReais(precoUSD, cotacao) {
    if (!precoUSD || !cotacao) return null
    return Math.round(precoUSD * cotacao * 100) / 100
}

// Aviso da barra do topo: teste acabando, Pix acabando ou cartão em atraso (até 7 dias antes).
export function avisoDeVencimento(assinatura) {
    if (!assinatura?.acesso?.liberado) return null
    const { status, cobranca } = assinatura
    const ate = assinatura.acesso.ate
    if (!ate) return null
    const dias = diasAte(ate)
    if (dias > 7) return null

    if (status === 'trial' || status === 'pendente') return { tipo: 'teste', dias, tom: dias <= 2 ? 'danger' : 'warning', botao: 'assinar' }
    if (status === 'ativa' && cobranca === 'pix') return { tipo: 'pix', dias, tom: dias <= 2 ? 'danger' : 'warning', botao: 'renovar' }
    if (status === 'inadimplente') return { tipo: 'atraso', dias, tom: 'danger', botao: 'atualizar' }
    return null
}

export function somenteDigitos(valor) {
    return String(valor ?? '').replace(/\D/g, '')
}

export function formatarDocumento(valor) {
    const d = somenteDigitos(valor).slice(0, 14)
    if (d.length <= 11) {
        return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2')
}

export function documentoCompleto(valor) {
    const n = somenteDigitos(valor).length
    return n === 11 || n === 14
}

export function formatarContagem(ms) {
    const total = Math.max(0, Math.floor(ms / 1000))
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
