import { useCallback, useEffect, useRef, useState } from 'react'
import Modal from '@/components/Modal/Modal'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData, formatarMoeda } from '@/i18n/formatar'
import { IconeCheck } from '@/components/Icones/Icones'
import { gerarPix, sincronizarPix } from '../assinatura.api'
import { documentoCompleto, formatarContagem, formatarDocumento } from '../assinatura.utils'
import './pix-modal.css'

const INTERVALO_CONSULTA_MS = 5000
const SITUACOES_ENCERRADAS = ['expirado', 'cancelado', 'rejeitado']

// Pix avulso (Brasil): pede o documento, mostra o QR Code e confirma sozinho quando o pagamento cai.
export function PixModal({ plano, onPago, onClose }) {
    const { t, idioma } = useIdioma()
    const [etapa, setEtapa] = useState('documento')
    const [documento, setDocumento] = useState('')
    const [gerando, setGerando] = useState(false)
    const [erro, setErro] = useState(null)
    const [pagamento, setPagamento] = useState(null)
    const [encerrado, setEncerrado] = useState(false)
    const [acessoAte, setAcessoAte] = useState(null)
    const [agora, setAgora] = useState(() => Date.now())
    const [verificando, setVerificando] = useState(false)
    const [copiado, setCopiado] = useState(false)
    const codigoRef = useRef(null)

    const restanteMs = pagamento?.expiraEm ? new Date(pagamento.expiraEm).getTime() - agora : 0
    const expirado = etapa === 'qr' && (encerrado || restanteMs <= 0)

    const consultar = useCallback(async () => {
        try {
            const { data } = await sincronizarPix()
            const situacao = data.pagamento?.status
            if (situacao === 'aprovado') {
                setAcessoAte(data.assinatura.acesso?.ate ?? data.assinatura.proximaCobranca)
                onPago?.(data.assinatura)
                setEtapa('pago')
            } else if (SITUACOES_ENCERRADAS.includes(situacao)) {
                setEncerrado(true)
            }
        } catch {
            // falha momentânea: a próxima consulta tenta de novo
        }
    }, [onPago])

    useEffect(() => {
        if (etapa !== 'qr' || expirado) return undefined
        const consulta = setInterval(consultar, INTERVALO_CONSULTA_MS)
        const relogio = setInterval(() => setAgora(Date.now()), 1000)
        return () => {
            clearInterval(consulta)
            clearInterval(relogio)
        }
    }, [etapa, expirado, consultar])

    async function gerar(e) {
        e?.preventDefault()
        setErro(null)
        setGerando(true)
        try {
            const { data } = await gerarPix(plano._id, documento)
            setPagamento(data)
            setEncerrado(false)
            setAgora(Date.now())
            setEtapa('qr')
        } catch (err) {
            setErro(err)
        } finally {
            setGerando(false)
        }
    }

    async function verificarAgora() {
        setVerificando(true)
        await consultar()
        setVerificando(false)
    }

    async function copiar() {
        try {
            await navigator.clipboard.writeText(pagamento.qrCode)
            setCopiado(true)
            setTimeout(() => setCopiado(false), 2500)
        } catch {
            codigoRef.current?.select()
        }
    }

    return (
        <Modal title={t('assinatura.pix.titulo')} onClose={onClose} persistente className="pix-modal">
            {(fechar) => (
                <>
                    {etapa === 'documento' && (
                        <form className="modal-form" onSubmit={gerar}>
                            <div className="pix__resumo">
                                <span>{plano.nome}</span>
                                <strong>{formatarMoeda(plano.precoBRL, 'BRL', idioma)}</strong>
                                <small>{t('assinatura.pix.dias')}</small>
                            </div>
                            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
                            <div className="field">
                                <label className="field__label" htmlFor="pix-documento">{t('assinatura.pix.documento')}</label>
                                <input id="pix-documento" className="input" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00"
                                    value={documento} onChange={(e) => setDocumento(formatarDocumento(e.target.value))} data-autofocus required />
                            </div>
                            <p className="modal-form__hint">{t('assinatura.pix.documentoDica')}</p>
                            <div className="modal__footer">
                                <button type="button" className="btn btn--ghost" onClick={fechar}>{t('comum.cancelar')}</button>
                                <button type="submit" className={`btn btn--primary${gerando ? ' btn--loading' : ''}`} disabled={gerando || !documentoCompleto(documento)}>
                                    {gerando ? t('assinatura.pix.gerando') : t('assinatura.pix.gerar')}
                                </button>
                            </div>
                        </form>
                    )}

                    {etapa === 'qr' && !expirado && (
                        <div className="pix">
                            <p className="pix__valor">
                                <strong>{formatarMoeda(pagamento.valor, 'BRL', idioma)}</strong>
                                <span>{plano.nome} · 30 dias</span>
                            </p>
                            {pagamento.qrCodeBase64 && (
                                <div className="pix__qr">
                                    <img src={`data:image/png;base64,${pagamento.qrCodeBase64}`} alt={t('assinatura.pix.qr')} width="220" height="220" />
                                </div>
                            )}
                            <p className="pix__expira">{t('assinatura.pix.expiraEm')} <strong>{formatarContagem(restanteMs)}</strong></p>
                            <div className="pix__codigo">
                                <label className="field__label" htmlFor="pix-codigo">{t('assinatura.pix.copiaCola')}</label>
                                <div className="pix__codigo-linha">
                                    <input id="pix-codigo" className="input" readOnly value={pagamento.qrCode} ref={codigoRef} onFocus={(e) => e.target.select()} />
                                    <button type="button" className="btn btn--primary btn--sm" onClick={copiar} data-autofocus>
                                        {copiado ? t('comum.copiado') : t('comum.copiar')}
                                    </button>
                                </div>
                            </div>
                            <p className="pix__status" role="status">
                                <span className="pix__pulso" aria-hidden="true" />
                                {t('assinatura.pix.aguardando')}
                            </p>
                            <div className="modal__footer">
                                <button type="button" className="btn btn--ghost" onClick={fechar}>{t('comum.fechar')}</button>
                                <button type="button" className={`btn btn--ghost${verificando ? ' btn--loading' : ''}`} onClick={verificarAgora} disabled={verificando}>
                                    {verificando ? t('assinatura.pix.verificando') : t('assinatura.pix.verificar')}
                                </button>
                            </div>
                        </div>
                    )}

                    {expirado && (
                        <div className="pix pix--aviso">
                            <h4>{t('assinatura.pix.expirado')}</h4>
                            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
                            <div className="modal__footer">
                                <button type="button" className="btn btn--ghost" onClick={fechar}>{t('comum.fechar')}</button>
                                <button type="button" className={`btn btn--primary${gerando ? ' btn--loading' : ''}`} onClick={gerar} disabled={gerando} data-autofocus>
                                    {gerando ? t('assinatura.pix.gerando') : t('assinatura.pix.gerarOutro')}
                                </button>
                            </div>
                        </div>
                    )}

                    {etapa === 'pago' && (
                        <div className="pix pix--pago" role="status">
                            <div className="pix__sucesso" aria-hidden="true"><IconeCheck /></div>
                            <h4>{t('assinatura.pix.pago')}</h4>
                            {acessoAte && <p>{t('assinatura.pix.pagoAte', { data: formatarData(acessoAte, idioma) })}</p>}
                            <div className="modal__footer">
                                <button type="button" className="btn btn--primary" onClick={fechar} data-autofocus>{t('comum.fechar')}</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </Modal>
    )
}

export default PixModal
