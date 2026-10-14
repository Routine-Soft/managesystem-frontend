import './Marca.css'

// Marca: selo com "pulso" (monitoramento) sobre o degradê + nome da empresa logada.
export function Marca({ empresa }) {
    return (
        <div className="marca">
            <span className="marca__selo" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h4l3-7 4 14 3-7h4" />
                </svg>
            </span>
            <span className="marca__textos">
                <strong>ServerFall</strong>
                {empresa && <span title={empresa}>{empresa}</span>}
            </span>
        </div>
    )
}

export default Marca
