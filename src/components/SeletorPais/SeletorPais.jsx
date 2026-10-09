import { useIdioma } from '@/i18n/useIdioma'
import { listaDePaises } from '@/i18n/paises'

export function SeletorPais({ id, value, onChange, required = false }) {
    const { idioma } = useIdioma()
    return (
        <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
            {listaDePaises(idioma).map((p) => <option key={p.codigo} value={p.codigo}>{p.nome}</option>)}
        </select>
    )
}

export default SeletorPais
