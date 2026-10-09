import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { useIdioma } from '@/i18n/useIdioma'
import { atualizarServidor } from '../servidor.api'
import ServidorForm from './ServidorForm'

export function EditarServidorModal({ servidor, onSalvo, onClose }) {
    const { t } = useIdioma()
    const [form, setForm] = useState({
        nome: servidor.nome,
        url: servidor.url ?? '',
        limiteLentidaoMs: servidor.limiteLentidaoMs ?? 3000,
        custo: { valor: servidor.custo?.valor ?? '', moeda: servidor.custo?.moeda ?? 'USD', provedor: servidor.custo?.provedor ?? '' },
    })
    const [erro, setErro] = useState(null)

    async function salvar() {
        setErro(null)
        try {
            const { data } = await atualizarServidor(servidor._id, { ...form, limiteLentidaoMs: Number(form.limiteLentidaoMs) || 3000 })
            onSalvo?.(data)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return (
        <Modal title={t('servidor.form.editarTitulo')} onClose={onClose}>
            {(fechar) => (
                <ModalForm erro={erro} onSubmit={salvar} fechar={fechar} submitLabel={t('comum.salvarAlteracoes')}>
                    <ServidorForm form={form} setForm={setForm} />
                </ModalForm>
            )}
        </Modal>
    )
}

export default EditarServidorModal
