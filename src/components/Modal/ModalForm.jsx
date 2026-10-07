import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'

// Formulário dentro do modal: mostra o erro no próprio modal, "Salvando..." no botão e fecha quando salva.
export function ModalForm({ erro, onSubmit, submitDisabled = false, submitLabel, loadingLabel, fechar, children }) {
    const { t } = useIdioma()
    const [salvando, setSalvando] = useState(false)
    const [tentouSalvar, setTentouSalvar] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setSalvando(true)
        setTentouSalvar(true)
        const salvo = await onSubmit()
        setSalvando(false)
        if (salvo) fechar()
    }

    return (
        <form className="modal-form" onSubmit={handleSubmit}>
            {tentouSalvar && !salvando && erro && (
                <p className="alert alert--error" role="alert">{erro.message}</p>
            )}

            {children}

            <div className="modal__footer">
                <button className="btn btn--ghost" type="button" onClick={fechar}>{t('comum.cancelar')}</button>
                <button className={`btn btn--primary${salvando ? ' btn--loading' : ''}`} type="submit" disabled={salvando || submitDisabled}>
                    {salvando ? (loadingLabel ?? t('comum.salvando')) : (submitLabel ?? t('comum.salvar'))}
                </button>
            </div>
        </form>
    )
}

export default ModalForm
