import { useIdioma } from '@/i18n/useIdioma'
import { formatarNumero, formatarPct } from '@/i18n/formatar'
import MapaMundi from '@/components/graficos/MapaMundi'
import { bandeira, nomeDoPais } from '@/components/graficos/mapa.paises'
import { IconeGlobo } from '@/components/Icones/Icones'

const VISIVEIS = 8

// De onde vêm os acessos do período: mapa pintado por país e a lista com número e porcentagem.
export function CardMapa({ paises, periodo }) {
    const { t, idioma } = useIdioma()
    const lista = paises ?? []
    const total = lista.reduce((soma, p) => soma + p.req, 0)
    const valores = Object.fromEntries(lista.filter((p) => p.pais !== '??').map((p) => [p.pais, p.req]))
    const conhecidos = lista.filter((p) => p.pais !== '??')
    const desconhecido = lista.find((p) => p.pais === '??')
    const topo = conhecidos.slice(0, VISIVEIS)
    const resto = conhecidos.slice(VISIVEIS)
    const linhas = [
        ...topo.map((p) => ({ chave: p.pais, icone: bandeira(p.pais), nome: nomeDoPais(p.pais, idioma), req: p.req })),
        ...(resto.length ? [{ chave: 'outros', icone: '🌍', nome: t('servidor.mapa.outros', { n: resto.length }), req: resto.reduce((s, p) => s + p.req, 0) }] : []),
        ...(desconhecido ? [{ chave: '??', icone: '❔', nome: t('servidor.mapa.desconhecido'), req: desconhecido.req }] : []),
    ]
    const pct = (n) => formatarPct(total ? (n / total) * 100 : 0, idioma, 1)

    return (
        <section className="card bloco" style={{ '--i': 5 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeGlobo />{t('servidor.mapa.titulo')}</h2>
                <span className="badge badge--neutro">{t(`servidor.periodo.${periodo}`)}</span>
            </div>

            {total === 0 ? (
                <p className="texto-suave">{t('servidor.mapa.vazio')}</p>
            ) : (
                <>
                    <MapaMundi
                        valores={valores}
                        rotulo={t('servidor.mapa.rotulo')}
                        legendaMenos={t('servidor.mapa.menos')}
                        legendaMais={t('servidor.mapa.mais')}
                        dica={(sigla, n) => (
                            <>
                                <strong>{bandeira(sigla)} {nomeDoPais(sigla, idioma)}</strong>
                                <span>{t('servidor.mapa.dica', { n: formatarNumero(n, idioma), pct: pct(n) })}</span>
                            </>
                        )}
                    />
                    <ul className="paises">
                        {linhas.map((l, i) => (
                            <li key={l.chave} style={{ '--i': i }}>
                                <span className="paises__nome"><span aria-hidden="true">{l.icone}</span>{l.nome}</span>
                                <span className="paises__barra" aria-hidden="true"><i style={{ width: `${total ? (l.req / total) * 100 : 0}%` }} /></span>
                                <strong className="mono">{formatarNumero(l.req, idioma)}</strong>
                                <span className="mono paises__pct">{pct(l.req)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="texto-pequeno">
                        {t('servidor.mapa.paises', { n: conhecidos.length })} · <a className="link" href="https://db-ip.com" target="_blank" rel="noopener noreferrer">{t('servidor.mapa.credito')}</a>
                    </p>
                </>
            )}
        </section>
    )
}

export default CardMapa
