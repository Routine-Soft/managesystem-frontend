import { useIdioma } from '@/i18n/useIdioma'
import { formatarDataHora, formatarHora, formatarNumero } from '@/i18n/formatar'
import GraficoBarras from '@/components/graficos/GraficoBarras'
import { IconeAtividade } from '@/components/Icones/Icones'

export function CardRequisicoes({ serie, periodo }) {
    const { t, idioma } = useIdioma()
    const total = serie.reduce((s, p) => s + (p.req ?? 0), 0)
    const e4 = serie.reduce((s, p) => s + (p.req4xx ?? 0), 0)
    const e5 = serie.reduce((s, p) => s + (p.req5xx ?? 0), 0)
    const curto = periodo === '1h' || periodo === '24h'

    return (
        <section className="card bloco" style={{ '--i': 4 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeAtividade />{t('servidor.requisicoes.titulo')}</h2>
                <span className="badge badge--neutro">{t(`servidor.periodo.${periodo}`)}</span>
            </div>
            <dl className="numeros-linha">
                <div><dt>{t('servidor.requisicoes.total')}</dt><dd className="mono">{formatarNumero(total, idioma)}</dd></div>
                <div><dt>{t('servidor.requisicoes.erros4xx')}</dt><dd className="mono">{formatarNumero(e4, idioma)}</dd></div>
                <div><dt>{t('servidor.requisicoes.erros5xx')}</dt><dd className="mono" data-tom={e5 ? 'danger' : undefined}>{formatarNumero(e5, idioma)}</dd></div>
            </dl>
            <GraficoBarras
                pontos={serie.map((p) => ({ x: new Date(p.em).getTime(), total: p.req ?? 0, erro: p.req5xx ?? 0 }))}
                formatarX={(x) => (curto ? formatarHora(x, idioma) : formatarDataHora(x, idioma))}
                rotuloFim={t('servidor.agora')}
                rotulo={t('servidor.requisicoes.titulo')}
                dica={(p) => t('servidor.requisicoes.tooltip', { total: formatarNumero(p.total, idioma), erros: formatarNumero(p.erro, idioma) })}
                semDados={t('servidor.requisicoes.semNginx')}
            />
            <ul className="legenda">
                <li><i style={{ '--cor': 'var(--chart-1)' }} />{t('servidor.requisicoes.total')}</li>
                <li><i style={{ '--cor': 'var(--danger)' }} />{t('servidor.requisicoes.erros5xx')}</li>
            </ul>
        </section>
    )
}

export default CardRequisicoes
