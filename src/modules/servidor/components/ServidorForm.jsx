import { useIdioma } from '@/i18n/useIdioma'

const MOEDAS = ['USD', 'BRL', 'EUR']

// Campos do servidor (usados para adicionar e editar).
export function ServidorForm({ form, setForm }) {
    const { t } = useIdioma()
    const campo = (nome) => ({ value: form[nome] ?? '', onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })
    const custo = (nome) => ({ value: form.custo?.[nome] ?? '', onChange: (e) => setForm({ ...form, custo: { ...form.custo, [nome]: e.target.value } }) })
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
            <div className="field">
                <label className="field__label" htmlFor="srv-provedor">{t('servidor.form.provedor')} <small>({t('comum.opcional')})</small></label>
                <input id="srv-provedor" className="input" placeholder="AWS, Hostinger, Vercel..." {...custo('provedor')} />
            </div>
            <div className="field">
                <label className="field__label" htmlFor="srv-custo">{t('servidor.form.custo')} <small>({t('comum.opcional')})</small></label>
                <div className="valor-moeda">
                    <select className="input" aria-label={t('servidor.form.moeda')} {...custo('moeda')}>
                        {MOEDAS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <input id="srv-custo" className="input" inputMode="decimal" placeholder="0,00" {...custo('valor')} />
                </div>
                <span className="field__hint">{t('servidor.form.custoDica')}</span>
            </div>
        </>
    )
}

export default ServidorForm
