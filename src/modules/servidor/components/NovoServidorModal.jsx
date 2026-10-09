import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { useIdioma } from '@/i18n/useIdioma'
import { criarServidor } from '../servidor.api'
import ServidorForm from './ServidorForm'
import ComandoInstalacao from './ComandoInstalacao'

// Dois passos: os dados do servidor e, depois, o comando para instalar o agente.
export function NovoServidorModal({ onCriado, onClose }) {
    const { t } = useIdioma()
    const [form, setForm] = useState({ nome: '', url: '', limiteLentidaoMs: 3000, custo: { valor: '', moeda: 'USD', provedor: '' } })
    const [erro, setErro] = useState(null)
    const [criado, setCriado] = useState(null)

    async function salvar() {
        setErro(null)
        try {
            const { data } = await criarServidor({ ...form, limiteLentidaoMs: Number(form.limiteLentidaoMs) || 3000 })
            setCriado(data)
            onCriado?.(data.servidor)
            return false
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return (
        <Modal title={criado ? t('servidor.instalar.titulo') : t('servidor.form.novoTitulo')} onClose={onClose} wide={!!criado} persistente={!!criado}>
            {(fechar) => criado ? (
                <div className="modal-form">
                    <ComandoInstalacao comando={criado.comando} comandoRemocao={criado.comandoRemocao} />
                    <div className="modal__footer">
                        <button type="button" className="btn btn--primary" onClick={fechar}>{t('comum.fechar')}</button>
                    </div>
                </div>
            ) : (
                <ModalForm erro={erro} onSubmit={salvar} fechar={fechar} submitLabel={t('servidor.form.criar')} loadingLabel={t('servidor.form.criando')}>
                    <ServidorForm form={form} setForm={setForm} />
                </ModalForm>
            )}
        </Modal>
    )
}

export default NovoServidorModal
