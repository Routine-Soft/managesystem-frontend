import { useState } from 'react'
import './graficos.css'

// Um quadradinho por dia (30 dias): verde operacional, vermelho queda, amarelo lentidão, cinza sem dados.
export function BarrasDisponibilidade({ dias, rotuloDoDia, rotulo }) {
    const [ativo, setAtivo] = useState(null)
    return (
        <div className="disponibilidade" role="list" aria-label={rotulo} onPointerLeave={() => setAtivo(null)}>
            {dias.map((d, i) => (
                <span
                    key={d.dia}
                    role="listitem"
                    tabIndex={0}
                    className="disponibilidade__dia"
                    data-estado={d.estado}
                    style={{ '--i': i }}
                    aria-label={rotuloDoDia(d)}
                    onPointerEnter={() => setAtivo(i)}
                    onFocus={() => setAtivo(i)}
                    onBlur={() => setAtivo(null)}
                />
            ))}
            {ativo !== null && (
                <div className="grafico__dica disponibilidade__dica" style={{ left: `${((ativo + 0.5) / dias.length) * 100}%` }} role="status">
                    <span>{rotuloDoDia(dias[ativo])}</span>
                </div>
            )}
        </div>
    )
}

export default BarrasDisponibilidade
