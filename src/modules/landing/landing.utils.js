// Rolagem até uma seção da página (o HashRouter usa o "#" das rotas, então não dá para usar âncoras).
export function rolarPara(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function ordenarPlanos(planos) {
    return [...planos].sort((a, b) => (a.tipo !== b.tipo ? (a.tipo === 'gratis' ? -1 : 1) : a.precoUSD - b.precoUSD))
}
