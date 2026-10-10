import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeAtualizar, IconeServidor } from '@/components/Icones/Icones'
import { formatarMoeda, formatarRelativo } from '@/i18n/formatar'
import AcaoServidorModal from '../AcaoServidorModal'

const TOM_DA_ACAO = { pendente: 'info', enviada: 'info', executando: 'warning', ok: 'success', erro: 'danger', expirada: 'neutro' }

// Botões "Instalar atualizações" e "Reiniciar" (só se o agente foi instalado com --permitir-acoes) e a última ação.
function AcoesDoServidor({ servidor: s, agora, onPedido }) {
    const { t, idioma } = useIdioma()
    const [modal, setModal] = useState(null)
    const ultima = s.acoes?.[0]
    const emAndamento = ['pendente', 'enviada', 'executando'].includes(ultima?.status)

    if (!s.agente?.acoesPermitidas) {
        return <p className="texto-pequeno acoes-servidor__dica">{t('servidor.acoes.semPermissao')}</p>
    }
    return (
        <div className="acoes-servidor">
            <div className="acoes-servidor__botoes">
                <button type="button" className="btn btn--primary btn--sm" disabled={emAndamento} onClick={() => setModal('atualizar')}>
                    <IconeAtualizar />{t('servidor.acoes.atualizar')}
                </button>
                <button type="button" className="btn btn--ghost btn--sm" disabled={emAndamento} onClick={() => setModal('reiniciar')}>
                    {t('servidor.acoes.reiniciar')}
                </button>
            </div>
            {ultima && (
                <div className="acoes-servidor__ultima">
                    <span className={`badge badge--${TOM_DA_ACAO[ultima.status] ?? 'neutro'}${emAndamento ? ' badge--live' : ''}`}>{t(`servidor.acoes.status.${ultima.status}`)}</span>
                    <span className="texto-pequeno">
                        {t('servidor.acoes.ultima', {
                            acao: t(`servidor.acoes.${ultima.tipo}`),
                            quando: formatarRelativo(ultima.concluidaEm ?? ultima.pedidaEm, idioma, agora),
                            quem: ultima.pedidaPor ? ` · ${ultima.pedidaPor}` : '',
                        })}
                    </span>
                    {ultima.saida && (
                        <details className="acoes-servidor__saida">
                            <summary>{t('servidor.acoes.verSaida')}</summary>
                            <pre>{ultima.saida}</pre>
                        </details>
                    )}
                </div>
            )}
            {modal && <AcaoServidorModal servidorId={s._id} tipo={modal} onPedido={onPedido} onClose={() => setModal(null)} />}
        </div>
    )
}

export function CardSistema({ servidor: s, agora, onPedido, mostrarAcoes = true }) {
    const { t, idioma } = useIdioma()
    const [aberto, setAberto] = useState(false)
    const lista = s.pacotes?.lista ?? []
    const seguranca = lista.filter((p) => p.seguranca)
    const outras = lista.filter((p) => !p.seguranca)
    const verificado = !!s.pacotes?.verificadoEm

    return (
        <section className="card bloco" style={{ '--i': 7 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeServidor />{t('servidor.so.titulo')}</h2>
                {verificado && <span className={`badge badge--${seguranca.length ? 'danger' : lista.length ? 'warning' : 'success'}`}>{lista.length ? t('servidor.so.pacotes', { n: lista.length }) : t('servidor.so.emDia')}</span>}
            </div>

            {(s.custo?.valor != null || s.custo?.provedor) && (
                <p className="custo-servidor">
                    <span>{t('servidor.so.custo')}</span>
                    <strong className="mono">{s.custo?.valor != null ? `${formatarMoeda(s.custo.valor, s.custo.moeda, idioma)}${t('servidor.so.porMes')}` : '—'}</strong>
                    {s.custo?.provedor && <span className="texto-pequeno">{s.custo.provedor}</span>}
                </p>
            )}

            {!verificado ? (
                <p className="texto-suave">{t('servidor.so.semInventario')}</p>
            ) : (
                <>
                    {s.sistema?.so && <p className="texto-pequeno">{s.sistema.so} · kernel {s.sistema.kernel} · {s.sistema.arquitetura}</p>}
                    <ul className="linhas">
                        {s.sistema?.atualizacoesAutomaticas != null && (
                            <li><span>{t('servidor.so.automaticas')}</span><strong data-tom={s.sistema.atualizacoesAutomaticas ? 'success' : 'warning'}>{t(s.sistema.atualizacoesAutomaticas ? 'servidor.so.ligadas' : 'servidor.so.desligadas')}</strong></li>
                        )}
                        <li><span>{t('servidor.so.seguranca')}</span><strong className="mono" data-tom={seguranca.length ? 'danger' : undefined}>{seguranca.length}</strong></li>
                        <li><span>{t('servidor.so.outras')}</span><strong className="mono">{outras.length}</strong></li>
                        <li><span>{t('servidor.so.reinicio')}</span><strong className="mono" data-tom={s.pacotes.reinicioNecessario ? 'warning' : 'success'}>{s.pacotes.reinicioNecessario ? t('comum.sim') : t('comum.nao')}</strong></li>
                    </ul>

                    {mostrarAcoes && <AcoesDoServidor servidor={s} agora={agora} onPedido={onPedido} />}

                    {lista.length > 0 && (
                        <details className="pacotes" open={aberto} onToggle={(e) => setAberto(e.currentTarget.open)}>
                            <summary>{t('servidor.so.verPacotes')}</summary>
                            <ul className="pacotes__lista">
                                {[...seguranca, ...outras].map((p, i) => (
                                    <li key={`${p.nome}-${i}`}>
                                        <span className="mono">{p.nome}</span>
                                        <span className="mono texto-pequeno">{p.atual ?? ''} → {p.nova}</span>
                                        {p.seguranca && <span className="badge badge--danger">{t('servidor.deps.filtro.seguranca')}</span>}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}

                    {(s.versoes ?? []).length > 0 && (
                        <>
                            <h3 className="bloco__subtitulo">{t('servidor.so.versoes')}</h3>
                            <ul className="versoes">
                                {s.versoes.map((v) => <li key={v.nome}><span>{v.nome}</span><strong className="mono">{v.versao}</strong></li>)}
                            </ul>
                        </>
                    )}
                </>
            )}
        </section>
    )
}

export default CardSistema
