import comum from './textos/comum'
import auth from './textos/auth'
import servidor from './textos/servidor'
import site from './textos/site'
import alerta from './textos/alerta'
import assinatura from './textos/assinatura'
import conta from './textos/conta'
import admin from './textos/admin'
import contratante from './textos/contratante'
import portal from './textos/portal'

// Cada área tem { pt: {...}, en: {...} }. A chave é "area.caminho.do.texto"; {nome} é trocado pelos parâmetros.
const TEXTOS = { comum, auth, servidor, site, alerta, assinatura, conta, admin, contratante, portal }

function buscar(tabela, caminho) {
    return caminho.reduce((obj, parte) => (obj == null ? undefined : obj[parte]), tabela)
}

export function traduzir(idioma, chave, params) {
    const [area, ...caminho] = chave.split('.')
    let texto = buscar(TEXTOS[area]?.[idioma], caminho) ?? buscar(TEXTOS[area]?.pt, caminho)
    if (texto === undefined) {
        if (import.meta.env.DEV) console.warn(`Texto não encontrado: ${chave}`)
        return chave
    }
    if (params && typeof texto === 'string') {
        texto = texto.replace(/\{(\w+)\}/g, (trecho, nome) => (nome in params ? String(params[nome]) : trecho))
    }
    return texto
}
