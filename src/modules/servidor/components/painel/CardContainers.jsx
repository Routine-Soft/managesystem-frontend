import { useIdioma } from '@/i18n/useIdioma'
import { formatarBytes, formatarPct, formatarRelativo } from '@/i18n/formatar'
import Medidor from '@/components/graficos/Medidor'
import { IconeContainer } from '@/components/Icones/Icones'
import { pct, tomDoUso } from '../../servidor.utils'

// Situação do container em uma palavra: problema de saúde pesa mais que "rodando".
function situacao(c) {
    if (c.estado === 'restarting') return { chave: 'reiniciando', tom: 'warning' }
    if (c.estado !== 'running') return { chave: 'parado', tom: 'danger' }
    if (c.saude === 'unhealthy') return { chave: 'doente', tom: 'danger' }
    return { chave: 'rodando', tom: 'success' }
}

// Memória e CPU de cada sistema que roda em container nesta máquina (só aparece quando há Docker).
export function CardContainers({ servidor: s, agora }) {
    const { t, idioma } = useIdioma()
    const lista = s.containers ?? []
    if (!lista.length) return null

    return (
        <section className="card bloco" style={{ '--i': 3 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeContainer />{t('servidor.containers.titulo')}</h2>
                <span className="badge badge--neutro">{t('servidor.containers.total', { n: lista.length })}</span>
            </div>
            <p className="texto-pequeno">{t('servidor.containers.dica')}</p>

            <ul className="containers">
                {lista.map((c, i) => {
                    const sit = situacao(c)
                    const uso = c.ramLimite ? pct(c.ramUsada, c.ramLimite) : null
                    return (
                        <li key={c.nome} className="container-item" style={{ '--i': i }}>
                            <div className="container-item__topo">
                                <strong className="mono">{c.nome}</strong>
                                <span className="container-item__selos">
                                    <span className={`badge badge--${sit.tom}${sit.chave === 'rodando' ? ' badge--live' : ''}`}>{t(`servidor.containers.${sit.chave}`)}</span>
                                    {c.oom && <span className="badge badge--danger">{t('servidor.containers.faltouMemoria')}</span>}
                                    {c.reinicios > 0 && <span className="badge badge--warning">{t('servidor.containers.reinicios', { n: c.reinicios })}</span>}
                                </span>
                            </div>
                            {c.estado === 'running' && (
                                <>
                                    <div className="container-item__numeros texto-pequeno">
                                        <span className="mono">
                                            {c.ramLimite
                                                ? t('servidor.containers.memoria', { usada: formatarBytes(c.ramUsada, idioma, 0), limite: formatarBytes(c.ramLimite, idioma, 0) })
                                                : t('servidor.containers.semLimite', { usada: formatarBytes(c.ramUsada, idioma, 0) })}
                                        </span>
                                        <span className="mono">{t('servidor.containers.cpu', { pct: formatarPct(c.cpu, idioma, 1) })}</span>
                                    </div>
                                    {uso !== null && <Medidor pct={uso} tom={tomDoUso(uso)} rotulo={`${c.nome} · RAM`} />}
                                    {c.iniciadoEm && <span className="texto-pequeno">{t('servidor.containers.desde', { quando: formatarRelativo(c.iniciadoEm, idioma, agora) })}</span>}
                                </>
                            )}
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}

export default CardContainers
