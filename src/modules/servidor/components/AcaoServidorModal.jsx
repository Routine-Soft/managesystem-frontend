import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { useIdioma } from '@/i18n/useIdioma'
import { pedirAcao } from '../servidor.api'

// Confirmação dos botões "Instalar atualizações" e "Reiniciar": explica o que acontece e pede a senha.
export function AcaoServidorModal({ servidorId, tipo, onPedido, onClose }) {
    const { t } = useIdioma()
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState(null)
    const atualizar = tipo === 'atualizar'

    async function confirmar() {
        setErro(null)
        try {
            const r = await pedirAcao(servidorId, tipo, senha)
            onPedido?.(r.message)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return (
        <Modal title={t(atualizar ? 'servidor.acoes.tituloAtualizar' : 'servidor.acoes.tituloReiniciar')} onClose={onClose}>
            {(fechar) => (
                <ModalForm
                    erro={erro}
                    onSubmit={confirmar}
                    fechar={fechar}
                    submitDisabled={!senha}
                    submitLabel={t(atualizar ? 'servidor.acoes.confirmarAtualizar' : 'servidor.acoes.confirmarReiniciar')}
                    loadingLabel={t('servidor.acoes.enviando')}
                >
                    <p className={`alert alert--${atualizar ? 'info' : 'warning'}`}>{t(atualizar ? 'servidor.acoes.explicaAtualizar' : 'servidor.acoes.explicaReiniciar')}</p>
                    <div className="field">
                        <label className="field__label" htmlFor="acao-senha">{t('servidor.acoes.senha')}</label>
                        <input id="acao-senha" className="input" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required data-autofocus />
                        <span className="field__hint">{t('servidor.acoes.senhaDica')}</span>
                    </div>
                </ModalForm>
            )}
        </Modal>
    )
}

export default AcaoServidorModal
