import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarDataHora } from '@/i18n/formatar'
import { IconeHistorico } from '@/components/Icones/Icones'

const VISIVEIS = 6
const TOM = { sistema: 'neutro', deploy: 'info', automatico: 'success', dependencia: 'violet', agente: 'neutro' }

export function CardHistorico({ eventos }) {
    const { t, idioma } = useIdioma()
    const [todos, setTodos] = useState(false)
    const visiveis = todos ? eventos : eventos.slice(0, VISIVEIS)

    return (
        <section className="card bloco" style={{ '--i': 9 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeHistorico />{t('servidor.historico.titulo')}</h2>
            </div>
            {eventos.length === 0 ? (
                <p className="texto-suave">{t('servidor.historico.vazio')}</p>
            ) : (
                <>
                    <ol className="linha-do-tempo">
                        {visiveis.map((e, i) => (
                            <li key={e._id} style={{ '--i': i }}>
                                <span className="linha-do-tempo__data">{formatarDataHora(e.em, idioma)}</span>
                                <div className="linha-do-tempo__corpo">
                                    <strong className="mono" title={e.detalhe ?? undefined}>{e.titulo}</strong>
                                    <span className={`badge badge--${TOM[e.tipo] ?? 'neutro'}`}>{t(`servidor.historico.tipo.${e.tipo}`)}</span>
                                </div>
                                {e.detalhe && e.tipo === 'sistema' && (
                                    <details className="linha-do-tempo__detalhe">
                                        <summary>{t('servidor.so.verPacotes')}</summary>
                                        <pre>{e.detalhe}</pre>
                                    </details>
                                )}
                            </li>
                        ))}
                    </ol>
                    {eventos.length > VISIVEIS && (
                        <button type="button" className="btn btn--ghost btn--block" onClick={() => setTodos(!todos)}>
                            {todos ? t('comum.verMenos') : t('comum.verTodos')}
                        </button>
                    )}
                </>
            )}
        </section>
    )
}

export default CardHistorico
