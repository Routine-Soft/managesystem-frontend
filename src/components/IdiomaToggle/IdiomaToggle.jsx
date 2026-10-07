import { useIdioma } from '@/i18n/useIdioma'
import './IdiomaToggle.css'

const OPCOES = [
    { valor: 'pt', rotulo: 'PT', nome: 'Português' },
    { valor: 'en', rotulo: 'EN', nome: 'English' },
]

// onTrocar: avisa quem precisa (ex.: salvar o idioma na conta, para os alertas do Telegram).
export function IdiomaToggle({ onTrocar }) {
    const { idioma, setIdioma, t } = useIdioma()

    function trocar(valor) {
        if (valor === idioma) return
        setIdioma(valor)
        onTrocar?.(valor)
    }

    return (
        <div className="idioma-toggle" role="radiogroup" aria-label={t('comum.idioma')}>
            {OPCOES.map((o) => (
                <button
                    key={o.valor}
                    type="button"
                    role="radio"
                    aria-checked={idioma === o.valor}
                    aria-label={o.nome}
                    title={o.nome}
                    className="idioma-toggle__btn"
                    onClick={() => trocar(o.valor)}
                >
                    {o.rotulo}
                </button>
            ))}
        </div>
    )
}

export default IdiomaToggle
