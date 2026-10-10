import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { useIdioma } from '@/i18n/useIdioma'

// Alterar senha (modelo do SoftwareClinic): senha atual, nova e confirmação lado a lado.
export function AlterarSenhaModal({ erro, onSave, onClose }) {
    const { t } = useIdioma()
    const [form, setForm] = useState({ atual: '', nova: '', confirmar: '' })
    const diferentes = form.confirmar !== '' && form.nova !== form.confirmar
    const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })

    return (
        <Modal title={t('conta.alterarSenha')} onClose={onClose}>
            {(fechar) => (
                <ModalForm erro={erro} fechar={fechar} submitLabel={t('conta.alterarSenha')} submitDisabled={diferentes}
                    onSubmit={() => onSave({ currentPassword: form.atual, newPassword: form.nova })}>
                    <div className="field">
                        <label className="field__label" htmlFor="senha-atual">{t('conta.senhaAtual')}</label>
                        <input id="senha-atual" className="input" type="password" autoComplete="current-password" required data-autofocus {...campo('atual')} />
                    </div>
                    <div className="modal-form__row">
                        <div className="field">
                            <label className="field__label" htmlFor="senha-nova">{t('conta.novaSenha')}</label>
                            <input id="senha-nova" className="input" type="password" autoComplete="new-password" minLength={6} required {...campo('nova')} />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="senha-confirmar">{t('conta.confirmarSenha')}</label>
                            <input id="senha-confirmar" className="input" type="password" autoComplete="new-password" required aria-invalid={diferentes || undefined} {...campo('confirmar')} />
                        </div>
                    </div>
                    {diferentes
                        ? <p className="modal-form__hint modal-form__hint--erro" role="alert">{t('conta.senhasDiferentes')}</p>
                        : <p className="modal-form__hint">{t('auth.senhaDica')}</p>}
                </ModalForm>
            )}
        </Modal>
    )
}

export default AlterarSenhaModal
