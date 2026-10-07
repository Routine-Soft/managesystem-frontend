import './graficos.css'

// Anel de porcentagem (ex.: RAM em uso). tom: success | warning | danger.
export function Anel({ pct, tom = 'success', rotulo, tamanho = 108 }) {
    const raio = 42
    const circ = 2 * Math.PI * raio
    const valor = Math.min(Math.max(pct ?? 0, 0), 100)
    return (
        <div className="anel" style={{ width: tamanho, height: tamanho }} data-tom={tom} role="img" aria-label={rotulo}>
            <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="anel__trilho" cx="50" cy="50" r={raio} />
                <circle className="anel__valor" cx="50" cy="50" r={raio} strokeDasharray={`${(valor / 100) * circ} ${circ}`} />
            </svg>
            <span className="anel__texto">{pct === null || pct === undefined ? '—' : `${Math.round(valor)}%`}</span>
        </div>
    )
}

export default Anel
