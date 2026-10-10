// "12 dias", "3 meses", "1 ano e 2 meses": há quanto tempo a conta é cliente (null = hoje).
export function tempoDeCasa(desde, idioma, agora = new Date()) {
    const inicio = new Date(desde)
    if (Number.isNaN(inicio.getTime())) return null
    const en = idioma === 'en'
    let meses = (agora.getFullYear() - inicio.getFullYear()) * 12 + (agora.getMonth() - inicio.getMonth())
    if (agora.getDate() < inicio.getDate()) meses -= 1

    if (meses < 1) {
        // Dias de calendário (ontem = 1 dia), não blocos de 24 horas.
        const dias = Math.max(0, Math.round((Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()) - Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())) / 86400000))
        if (dias === 0) return null
        return dias === 1 ? (en ? '1 day' : '1 dia') : (en ? `${dias} days` : `${dias} dias`)
    }
    const anos = Math.floor(meses / 12)
    const resto = meses % 12
    const textoMeses = resto === 1 ? (en ? '1 month' : '1 mês') : (en ? `${resto} months` : `${resto} meses`)
    if (anos === 0) return textoMeses
    const textoAnos = anos === 1 ? (en ? '1 year' : '1 ano') : (en ? `${anos} years` : `${anos} anos`)
    return resto ? `${textoAnos} ${en ? 'and' : 'e'} ${textoMeses}` : textoAnos
}

// Link para conversar no WhatsApp (DDD + número, com ou sem o 55 do Brasil).
export function linkWhatsapp(telefone) {
    let digitos = String(telefone ?? '').replace(/\D/g, '').replace(/^0+/, '')
    if (digitos.length === 10 || digitos.length === 11) digitos = `55${digitos}`
    return /^\d{12,13}$/.test(digitos) ? `https://wa.me/${digitos}` : null
}

export function iniciais(nome) {
    return String(nome ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

// Assinatura que ainda não foi paga pode ganhar mais dias de teste.
export function podeEstenderTeste(assinatura) {
    return !!assinatura && assinatura.status !== 'ativa' && !(assinatura.status === 'cancelada' && assinatura.acesso?.liberado)
}
