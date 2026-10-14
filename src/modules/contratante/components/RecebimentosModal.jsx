import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData } from '@/i18n/formatar'
import { conectarMercadoPago, conectarStripe, desconectarRecebimento } from '../contratante.api'

// Onde o programador recebe: o dinheiro do cliente cai direto na conta dele, sem passar pelo ServerFall.
function Gateway({ id, titulo, descricao, passos, rotulo, placeholder, conta, onConectar, onDesconectar }) {
    const { t, idioma } = useIdioma()
    const [chave, setChave] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [msg, setMsg] = useState(null)

    async function executar(acao) {
        setMsg(null)
        setEnviando(true)
        try {
            const r = await acao()
            setChave('')
            setMsg({ tipo: 'success', texto: r.message })
        } catch (e) {
            setMsg({ tipo: 'error', texto: e.message })
        } finally {
            setEnviando(false)
        }
    }

    const conectado = !!conta?.conectadoEm

    return (
        <section className="recebimento">
            <header className="recebimento__topo">
                <div>
                    <h3>{titulo}</h3>
                    <p className="texto-pequeno">{descricao}</p>
                </div>
                <span className={`badge badge--${conectado ? 'success' : 'info'}`}>{conectado ? t('contratante.recebimento.conectado') : t('contratante.recebimento.naoConectado')}</span>
            </header>

            {conectado ? (
                <div className="recebimento__conta">
                    <span>{[conta.conta, conta.final].filter(Boolean).join(' · ')}</span>
                    <span className="texto-pequeno">{t('contratante.recebimento.desde', { data: formatarData(conta.conectadoEm, idioma) })}</span>
                    <button type="button" className="btn btn--ghost btn--sm" disabled={enviando} onClick={() => executar(onDesconectar)}>{t('contratante.recebimento.desconectar')}</button>
                </div>
            ) : (
                <form className="recebimento__form" onSubmit={(e) => { e.preventDefault(); executar(() => onConectar(chave)) }}>
                    <ol className="recebimento__passos">{passos.map((p) => <li key={p}>{p}</li>)}</ol>
                    <div className="field">
                        <label className="field__label" htmlFor={`rec-${id}`}>{rotulo}</label>
                        <input id={`rec-${id}`} className="input mono" autoComplete="off" spellCheck="false" placeholder={placeholder} value={chave} onChange={(e) => setChave(e.target.value)} required />
                    </div>
                    <button type="submit" className={`btn btn--primary btn--sm${enviando ? ' btn--loading' : ''}`} disabled={enviando || !chave.trim()}>
                        {enviando ? t('contratante.recebimento.conectando') : t('contratante.recebimento.conectar')}
                    </button>
                </form>
            )}
            {msg && <p className={`alert alert--${msg.tipo}`} role={msg.tipo === 'error' ? 'alert' : 'status'}>{msg.texto}</p>}
        </section>
    )
}

export function RecebimentosModal({ recebimentos, onMudou, onClose }) {
    const { t } = useIdioma()

    async function acao(promessa) {
        const r = await promessa
        onMudou(r.data)
        return r
    }

    return (
        <Modal title={t('contratante.recebimento.titulo')} onClose={onClose} wide>
            {() => (
                <div className="recebimentos">
                    <p className="texto-suave">{t('contratante.recebimento.explicacao')}</p>
                    <Gateway
                        id="mp"
                        titulo="Mercado Pago"
                        descricao={t('contratante.recebimento.mpDescricao')}
                        passos={t('contratante.recebimento.mpPassos')}
                        rotulo="Access Token"
                        placeholder="APP_USR-..."
                        conta={recebimentos?.mercadoPago}
                        onConectar={(chave) => acao(conectarMercadoPago(chave))}
                        onDesconectar={() => acao(desconectarRecebimento('mercadopago'))}
                    />
                    <Gateway
                        id="stripe"
                        titulo="Stripe"
                        descricao={t('contratante.recebimento.stripeDescricao')}
                        passos={t('contratante.recebimento.stripePassos')}
                        rotulo={t('contratante.recebimento.chaveSecreta')}
                        placeholder="sk_live_..."
                        conta={recebimentos?.stripe}
                        onConectar={(chave) => acao(conectarStripe(chave))}
                        onDesconectar={() => acao(desconectarRecebimento('stripe'))}
                    />
                    <p className="texto-pequeno">{t('contratante.recebimento.seguranca')}</p>
                </div>
            )}
        </Modal>
    )
}

export default RecebimentosModal
