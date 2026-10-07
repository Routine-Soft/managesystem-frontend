// Datas no formato do <input type="date"> (AAAA-MM-DD) e de volta.
export function paraInputData(data) {
    return data ? new Date(data).toISOString().slice(0, 10) : ''
}

export function deInputData(texto) {
    return texto ? `${texto}T12:00:00.000Z` : null
}

// Data de vencimento que vale: a preenchida à mão tem prioridade sobre a da consulta pública.
export function vencimentoDoDominio(site) {
    if (site.manual?.expiraEm) return { data: site.manual.expiraEm, fonte: 'manual' }
    if (site.registro?.expiraEm) return { data: site.registro.expiraEm, fonte: 'rdap' }
    return { data: null, fonte: null }
}

export function formularioDoSite(site) {
    return {
        dominio: site?.dominio ?? '',
        servidorId: site?.servidorId ?? '',
        manual: {
            criadoEm: paraInputData(site?.manual?.criadoEm),
            expiraEm: paraInputData(site?.manual?.expiraEm),
            registrador: site?.manual?.registrador ?? '',
            valorRenovacao: site?.manual?.valorRenovacao ?? '',
            moeda: site?.manual?.moeda ?? 'BRL',
            renovacaoAutomatica: !!site?.manual?.renovacaoAutomatica,
            observacao: site?.manual?.observacao ?? '',
        },
        emails: {
            provedor: site?.emails?.provedor ?? '',
            vencimento: paraInputData(site?.emails?.vencimento),
            valor: site?.emails?.valor ?? '',
            moeda: site?.emails?.moeda ?? 'BRL',
            periodicidade: site?.emails?.periodicidade ?? 'anual',
            caixas: (site?.emails?.caixas ?? []).map((c) => ({ endereco: c.endereco, cotaGB: c.cotaGB ?? '', usadoGB: c.usadoGB ?? '' })),
        },
    }
}

export function dadosDoFormulario(form) {
    return {
        dominio: form.dominio,
        servidorId: form.servidorId || null,
        manual: { ...form.manual, criadoEm: deInputData(form.manual.criadoEm), expiraEm: deInputData(form.manual.expiraEm) },
        emails: { ...form.emails, vencimento: deInputData(form.emails.vencimento) },
    }
}
