import { useIdioma } from '@/i18n/useIdioma'

// Campos do servidor (usados para adicionar e editar).
export function ServidorForm({ form, setForm }) {
    const { t } = useIdioma()
    const campo = (nome) => ({ value: form[nome] ?? '', onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })
    return (
        <>
            <div className="field">
                <label className="field__label" htmlFor="srv-nome">{t('servidor.form.nome')}</label>
                <input id="srv-nome" className="input" placeholder={t('servidor.form.nomeDica')} required data-autofocus {...campo('nome')} />
            </div>
            <div className="field">
                <label className="field__label" htmlFor="srv-url">{t('servidor.form.url')} <small>({t('comum.opcional')})</small></label>
                <input id="srv-url" className="input" inputMode="url" placeholder="https://" {...campo('url')} />
                <span className="field__hint">{t('servidor.form.urlDica')}</span>
            </div>
            <div className="field">
                <label className="field__label" htmlFor="srv-lento">{t('servidor.form.lentidao')}</label>
                <input id="srv-lento" className="input" type="number" min="300" max="30000" step="100" {...campo('limiteLentidaoMs')} />
                <span className="field__hint">{t('servidor.form.lentidaoDica')}</span>
            </div>
        </>
    )
}

export default ServidorForm
