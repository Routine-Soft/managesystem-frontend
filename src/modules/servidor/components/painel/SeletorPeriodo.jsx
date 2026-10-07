import { useIdioma } from '@/i18n/useIdioma'

const PERIODOS = ['1h', '24h', '7d', '30d']

export function SeletorPeriodo({ periodo, setPeriodo }) {
    const { t } = useIdioma()
    return (
        <div className="pilulas" role="group" aria-label={t('servidor.periodoRotulo')}>
            {PERIODOS.map((p) => (
                <button key={p} type="button" aria-pressed={periodo === p} onClick={() => setPeriodo(p)}>{t(`servidor.periodo.${p}`)}</button>
            ))}
        </div>
    )
}

export default SeletorPeriodo
