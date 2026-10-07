import { useTheme } from '@/hooks/useTheme'
import { useIdioma } from '@/i18n/useIdioma'
import './ThemeToggle.css'

const OPTIONS = [
    {
        value: 'light',
        label: 'comum.temaClaro',
        icon: (
            <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </>
        ),
    },
    {
        value: 'dark',
        label: 'comum.temaEscuro',
        icon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
    },
    {
        value: 'system',
        label: 'comum.temaSistema',
        icon: (
            <>
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <path d="M8 21h8M12 17v4" />
            </>
        ),
    },
]

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const { t } = useIdioma()
    const activeIndex = OPTIONS.findIndex((option) => option.value === theme)

    return (
        <div className="theme-toggle" role="radiogroup" aria-label={t('comum.tema')} style={{ '--idx': activeIndex }}>
            <span className="theme-toggle__thumb" aria-hidden="true" />
            {OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={theme === option.value}
                    aria-label={t(option.label)}
                    title={t(option.label)}
                    className="theme-toggle__btn"
                    onClick={() => setTheme(option.value)}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {option.icon}
                    </svg>
                </button>
            ))}
        </div>
    )
}

export default ThemeToggle
