import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import { useIdioma } from '@/i18n/useIdioma'
import { novoComando } from '../servidor.api'
import ComandoInstalacao from './ComandoInstalacao'

// O token só aparece na criação; aqui a pessoa gera um comando novo (o antigo deixa de valer).
export function ComandoModal({ servidorId, onClose }) {
    const { t } = useIdioma()
    const [dados, setDados] = useState(null)
    const [gerando, setGerando] = useState(false)
    const [erro, setErro] = useState(null)

    async function gerar() {
        setErro(null)
        setGerando(true)
        try {
            const { data } = await novoComando(servidorId)
            setDados(data)
        } catch (e) {
            setErro(e)
        } finally {
            setGerando(false)
        }
    }

    return (
        <Modal title={t('servidor.comandoInstalacao')} onClose={onClose} wide>
            {(fechar) => (
                <div className="modal-form">
                    {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
                    <ComandoInstalacao comando={dados?.comando} comandoRemocao={dados?.comandoRemocao} />
                    <div className="modal__footer">
                        <button type="button" className="btn btn--ghost" onClick={fechar}>{t('comum.fechar')}</button>
                        {!dados && (
                            <button type="button" className={`btn btn--primary${gerando ? ' btn--loading' : ''}`} onClick={gerar} disabled={gerando} title={t('servidor.instalar.novoComandoDica')}>
                                {gerando ? t('servidor.instalar.gerando') : t('servidor.instalar.novoComando')}
                            </button>
                        )}
                    </div>
                    {!dados && <p className="texto-pequeno">{t('servidor.instalar.novoComandoDica')}</p>}
                </div>
            )}
        </Modal>
    )
}

export default ComandoModal
