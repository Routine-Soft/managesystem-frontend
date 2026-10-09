// Moedas da mensalidade. Cliente do Brasil paga pelo Mercado Pago, que só aceita real.
export const MOEDAS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BRL']

export function ehBrasil(pais) {
    return pais === 'BR'
}

export function totalDosItens(itens) {
    return Math.round((itens ?? []).reduce((soma, i) => soma + (Number(String(i.valor).replace(',', '.')) || 0), 0) * 100) / 100
}

export function formularioDoContratante(c, idioma) {
    return {
        nome: c?.nome ?? '',
        email: c?.email ?? '',
        pais: c?.pais ?? 'BR',
        idioma: c?.idioma ?? idioma ?? 'pt',
        servidores: (c?.servidores ?? []).map(String),
        sites: (c?.sites ?? []).map(String),
        cobranca: {
            ativa: !!c?.cobranca?.ativa,
            moeda: c?.cobranca?.moeda ?? 'BRL',
            diaVencimento: c?.cobranca?.diaVencimento ?? 10,
            itens: c?.cobranca?.itens?.length
                ? c.cobranca.itens.map((i) => ({ descricao: i.descricao, valor: String(i.valor) }))
                : [],
        },
    }
}

export function dadosDoFormulario(form) {
    return {
        ...form,
        cobranca: {
            ...form.cobranca,
            moeda: ehBrasil(form.pais) ? 'BRL' : form.cobranca.moeda,
            diaVencimento: Number(form.cobranca.diaVencimento) || 10,
            itens: form.cobranca.itens
                .map((i) => ({ descricao: i.descricao.trim(), valor: String(i.valor).replace(',', '.') }))
                .filter((i) => i.descricao),
        },
    }
}

export function alternar(lista, id) {
    return lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]
}

// Cor do selo da fatura.
export function tomDaFatura(f) {
    if (!f) return 'info'
    if (f.status === 'paga') return 'success'
    if (f.status === 'cancelada') return 'info'
    return f.vencida ? 'danger' : 'warning'
}

export function chaveDoStatusDaFatura(f) {
    if (f.status === 'aberta' && f.vencida) return 'vencida'
    return f.status
}
