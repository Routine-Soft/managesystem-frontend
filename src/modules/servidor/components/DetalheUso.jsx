import { useIdioma } from '@/i18n/useIdioma'

// Três caixinhas embaixo da barra de uso: quanto está usado, quanto sobra e o total.
export function DetalheUso({ detalhe }) {
    const { t } = useIdioma()
    if (!detalhe) return null
    return (
        <dl className="uso-detalhe">
            {['usado', 'livre', 'total'].filter((k) => detalhe[k] != null).map((k) => (
                <div key={k}><dt>{t(`servidor.grupo.${k}`)}</dt><dd className="mono">{detalhe[k]}</dd></div>
            ))}
        </dl>
    )
}

export default DetalheUso
