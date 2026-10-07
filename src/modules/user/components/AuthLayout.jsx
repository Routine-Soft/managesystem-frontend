import ThemeToggle from '@/components/ThemeToggle/ThemeToggle'
import IdiomaToggle from '@/components/IdiomaToggle/IdiomaToggle'
import './auth.css'

export function AuthLayout({ children, wide = false }) {
    return (
        <div className="auth-page">
            <div className="auth-bg" aria-hidden="true">
                <span className="auth-blob auth-blob--1" />
                <span className="auth-blob auth-blob--2" />
                <span className="auth-blob auth-blob--3" />
            </div>

            <div className="auth-toggle">
                <IdiomaToggle />
                <ThemeToggle />
            </div>

            <main className={`auth-card glass${wide ? ' auth-card--wide' : ''}`}>
                <div className="auth-logo" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12h4l3-7 4 14 3-7h4" />
                    </svg>
                </div>
                {children}
            </main>
        </div>
    )
}

export default AuthLayout
