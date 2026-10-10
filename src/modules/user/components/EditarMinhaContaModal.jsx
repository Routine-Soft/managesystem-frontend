import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import SeletorPais from '@/components/SeletorPais/SeletorPais'
import { useIdioma } from '@/i18n/useIdioma'

// Editar meus dados (modelo do SoftwareClinic). Empresa e país são da conta inteira: só o admin altera.
export function EditarMinhaContaModal({ perfil, ehAdmin, erro, onSave, onClose }) {
    const { t, setIdioma } = useIdioma()
    const [form, setForm] = useState({
        nomeCompleto: perfil.nomeCompleto ?? '',
        email: perfil.email ?? '',
        telefone: perfil.telefone ?? '',
        idioma: perfil.idioma ?? 'pt',
        nomeEmpresa: perfil.nomeEmpresa ?? '',
        pais: perfil.pais ?? 'BR',
    })
    const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })

    async function salvar() {
        const dados = { nomeCompleto: form.nomeCompleto, email: form.email, telefone: form.telefone, idioma: form.idioma }
        if (ehAdmin) Object.assign(dados, { nomeEmpresa: form.nomeEmpresa, pais: form.pais })
        const ok = await onSave(dados)
        if (ok) setIdioma(form.idioma)
        return ok
    }

    return (
        <Modal title={t('conta.editarTitulo')} onClose={onClose}>
            {(fechar) => (
                <ModalForm erro={erro} fechar={fechar} onSubmit={salvar} submitLabel={t('comum.salvarAlteracoes')}>
                    <div className="field">
                        <label className="field__label" htmlFor="mc-nome">{t('conta.nome')}</label>
                        <input id="mc-nome" className="input" required data-autofocus {...campo('nomeCompleto')} />
                    </div>
                    <div className="modal-form__row">
                        <div className="field">
                            <label className="field__label" htmlFor="mc-email">{t('conta.email')}</label>
                            <input id="mc-email" className="input" type="email" required {...campo('email')} />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="mc-tel">{t('conta.telefone')}</label>
                            <input id="mc-tel" className="input" type="tel" {...campo('telefone')} />
                        </div>
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="mc-idioma">{t('conta.idioma')}</label>
                        <select id="mc-idioma" className="input" {...campo('idioma')}>
                            <option value="pt">Português</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    {ehAdmin && (
                        <fieldset className="modal-form__section">
                            <legend>{t('conta.dadosEmpresa')}</legend>
                            <div className="modal-form__row">
                                <div className="field">
                                    <label className="field__label" htmlFor="mc-emp">{t('conta.empresa')}</label>
                                    <input id="mc-emp" className="input" required {...campo('nomeEmpresa')} />
                                </div>
                                <div className="field">
                                    <label className="field__label" htmlFor="mc-pais">{t('auth.pais')}</label>
                                    <SeletorPais id="mc-pais" value={form.pais} onChange={(pais) => setForm({ ...form, pais })} />
                                </div>
                            </div>
                            <p className="modal-form__hint">{t('auth.paisDica')}</p>
                        </fieldset>
                    )}
                </ModalForm>
            )}
        </Modal>
    )
}

export default EditarMinhaContaModal
