import './graficos.css'

// Barra de progresso fina (CPU, disco, dias para vencer...).
export function Medidor({ pct, tom = 'success', rotulo }) {
    const valor = Math.min(Math.max(pct ?? 0, 0), 100)
    return (
        <div className="medidor" data-tom={tom} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(valor)} aria-label={rotulo}>
            <span className="medidor__fill" style={{ width: `${valor}%` }} />
        </div>
    )
}

export default Medidor
