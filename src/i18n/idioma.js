// Idioma escolhido (pt ou en), guardado no navegador. Na primeira visita, segue o idioma do navegador.
const CHAVE = 'idioma'

export function lerIdioma() {
    try {
        const salvo = localStorage.getItem(CHAVE)
        if (salvo === 'pt' || salvo === 'en') return salvo
    } catch {
        // storage indisponível
    }
    return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function salvarIdioma(idioma) {
    try {
        localStorage.setItem(CHAVE, idioma)
    } catch {
        // storage indisponível: vale só nesta sessão
    }
    document.documentElement.lang = idioma === 'en' ? 'en' : 'pt-BR'
}

export const LOCALE = { pt: 'pt-BR', en: 'en-US' }
