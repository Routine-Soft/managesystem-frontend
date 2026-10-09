import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { diasAte, formatarData, formatarMoeda } from '@/i18n/formatar'
import { IconeCartao, IconeCheck, IconePix, IconeAbrir } from '@/components/Icones/Icones'
import { useAssinatura } from '../assinatura.hooks'
import { precoEmReais } from '../assinatura.utils'
import PixModal from './PixModal'
import './assinaturas-planos.css'
import './assinatura.css'

const TOM_DO_STATUS = { trial: 'info', pendente: 'warning', ativa: 'success', inadimplente: 'danger', cancelada: 'warning', expirada: 'danger' }

function LinhaDoStatus({ assinatura }) {
    const { t, idioma } = useIdioma()
    const ate = assinatura.acesso?.ate
    const data = ate ? formatarData(ate, idioma) : null
    switch (assinatura.status) {
        case 'trial':
        case 'pendente':
            return data ? <>{t('assinatura.testeAte', { data })} · {t('assinatura.testeRestam', { dias: Math.max(diasAte(ate), 0) })}</> : null
        case 'ativa':
            if (assinatura.cobranca === 'stripe') return assinatura.proximaCobranca ? t('assinatura.renovaEm', { data: formatarData(assinatura.proximaCobranca, idioma) }) : null
            return data ? t('assinatura.acessoAte', { data }) : null
        case 'cancelada':
            return data ? t('assinatura.canceladaAte', { data }) : null
        case 'inadimplente':
            return data ? t('assinatura.atrasoAte', { data }) : null
        default:
            return assinatura.acesso?.motivo ?? null
    }
}

function limites(plano, t) {
    const itens = []
    itens.push(plano.limiteServidores ? t('assinatura.limiteServidores', { n: plano.limiteServidores }) : t('assinatura.servidoresIlimitados'))
    itens.push(plano.limiteSites ? t('assinatura.limiteSites', { n: plano.limiteSites }) : t('assinatura.sitesIlimitados'))
    return itens
}

export function AssinaturaPage() {
    const { t, idioma } = useIdioma()
    const { assinatura, planos, pagamentos, loading, erro, aplicarAssinatura, irParaCheckout, irParaPortal } = useAssinatura({ comPagamentos: true })
    const [abrindo, setAbrindo] = useState(null)
    const [erroAcao, setErroAcao] = useState(null)
    const [pixDoPlano, setPixDoPlano] = useState(null)

    const pagos = planos.filter((p) => p.tipo === 'pago')
    const formas = assinatura?.formasDePagamento ?? {}
    const temCartaoAtivo = assinatura?.cobranca === 'stripe' && ['ativa', 'inadimplente', 'cancelada'].includes(assinatura?.status) && !!assinatura?.stripeSubscriptionId
    const pixAtivo = assinatura?.status === 'ativa' && assinatura?.cobranca === 'pix'

    async function executar(chave, acao) {
        setErroAcao(null)
        setAbrindo(chave)
        try {
            await acao()
        } catch (e) {
            setErroAcao(e)
            setAbrindo(null)
        }
    }

    return (
        <div className="page assinaturas">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('assinatura.titulo')}</h1>
                    <p className="page-subtitle">{t('assinatura.subtitulo')}</p>
                </div>
            </header>

            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
            {erroAcao && <p className="alert alert--error" role="alert">{erroAcao.message}</p>}

            {loading ? (
                <div className="card assinatura-atual" aria-busy="true">
                    <div className="skeleton skeleton--line" style={{ width: '30%' }} />
                    <div className="skeleton skeleton--line" style={{ width: '60%', height: 28 }} />
                </div>
            ) : assinatura && (
                <section className="card assinatura-atual">
                    <div className="assinatura-atual__info">
                        <span className="assinatura-atual__rotulo">{t('assinatura.seuPlano')}</span>
                        <strong className="assinatura-atual__plano">{assinatura.planoId?.nome}</strong>
                        <span className="assinatura-atual__linha"><LinhaDoStatus assinatura={assinatura} /></span>
                    </div>
                    <div className="assinatura-atual__lado">
                        <span className={`badge badge--${TOM_DO_STATUS[assinatura.status] ?? 'info'}`}>{t(`assinatura.status.${assinatura.status}`)}</span>
                        {['ativa', 'cancelada', 'inadimplente'].includes(assinatura.status) && (
                            <span className="assinatura-atual__cobranca">{t(`assinatura.cobranca.${assinatura.cobranca}`)}</span>
                        )}
                        {assinatura.stripeCustomerId && formas.cartao && (
                            <button type="button" className={`btn btn--ghost btn--sm${abrindo === 'portal' ? ' btn--loading' : ''}`} disabled={!!abrindo} onClick={() => executar('portal', irParaPortal)} title={t('assinatura.gerenciarDica')}>
                                <IconeAbrir />
                                {abrindo === 'portal' ? t('assinatura.abrindo') : t('assinatura.gerenciar')}
                            </button>
                        )}
                    </div>
                </section>
            )}

            {!loading && pagos.length === 0 && <p className="alert alert--info">{t('assinatura.nenhumPlano')}</p>}

            {!loading && pagos.length > 0 && (
                <div className="assinaturas__grade">
                    {pagos.map((plano, i) => {
                        const emReais = precoEmReais(plano.precoUSD, formas.cotacaoUSD)
                        const atual = String(assinatura?.planoId?._id) === String(plano._id) && ['ativa', 'cancelada', 'inadimplente'].includes(assinatura?.status)
                        const podeCartao = formas.cartao && !!plano.stripePriceId && !temCartaoAtivo && !pixAtivo
                        const podePix = formas.pix && !!plano.precoUSD && !temCartaoAtivo && (!pixAtivo || atual)
                        return (
                            <article key={plano._id} className="card plano-opcao" style={{ '--i': i }} data-atual={atual || undefined}>
                                <header className="plano-opcao__topo">
                                    <h2 className="plano-opcao__nome">{plano.nome}</h2>
                                    {atual && <span className="badge badge--success">{t('assinatura.planoAtual')}</span>}
                                </header>
                                {plano.descricao && <p className="plano-opcao__descricao">{plano.descricao}</p>}
                                <p className="plano-opcao__preco">
                                    <strong>{formatarMoeda(plano.precoUSD, 'USD', idioma)}</strong>
                                    <span>{t('assinatura.porMes')}</span>
                                </p>
                                {formas.pix && emReais && <p className="plano-opcao__dica">{t('assinatura.emReais', { valor: formatarMoeda(emReais, 'BRL', idioma) })}</p>}
                                <ul className="plano-opcao__lista">
                                    {[...limites(plano, t), ...t('assinatura.incluido')].map((item) => (
                                        <li key={item}><IconeCheck />{item}</li>
                                    ))}
                                </ul>
                                <div className="plano-opcao__acoes">
                                    {podeCartao && (
                                        <button type="button" className={`btn btn--primary btn--block${abrindo === plano._id ? ' btn--loading' : ''}`} disabled={!!abrindo} onClick={() => executar(plano._id, () => irParaCheckout(plano._id))}>
                                            <IconeCartao />
                                            {abrindo === plano._id ? t('assinatura.abrindo') : t('assinatura.assinarCartao')}
                                        </button>
                                    )}
                                    {podePix && (
                                        <button type="button" className={`btn ${podeCartao ? 'btn--ghost' : 'btn--primary'} btn--block`} disabled={!!abrindo} onClick={() => setPixDoPlano(plano)}>
                                            <IconePix />
                                            {pixAtivo ? t('assinatura.renovarPix') : t('assinatura.pagarPix')}
                                        </button>
                                    )}
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}

            {!loading && (
                <section className="card assinatura-pagamentos">
                    <h2 className="card__titulo">{t('assinatura.pagamentos')}</h2>
                    {pagamentos.length === 0 ? (
                        <p className="texto-suave">{t('assinatura.semPagamentos')}</p>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <tbody>
                                    {pagamentos.map((p) => (
                                        <tr key={p.id}>
                                            <td className="nowrap">{formatarData(p.aprovadoEm, idioma)}</td>
                                            <td>{p.plano ?? '—'}</td>
                                            <td>{t(`assinatura.metodo.${p.metodo}`)}</td>
                                            <td className="table__num">{formatarMoeda(p.valor, p.moeda, idioma)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {pixDoPlano && <PixModal plano={pixDoPlano} cotacao={formas.cotacaoUSD} onPago={aplicarAssinatura} onClose={() => setPixDoPlano(null)} />}
        </div>
    )
}

export default AssinaturaPage
