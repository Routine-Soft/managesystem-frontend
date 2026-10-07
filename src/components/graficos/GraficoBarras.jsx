import { useState } from 'react'
import { useLargura } from './useLargura'
import './graficos.css'

const MARGEM = { topo: 12, direita: 6, base: 24, esquerda: 6 }

// Barras de requisições por intervalo; a parte de cima de cada barra (vermelha) são os erros 5xx.
// pontos: [{ x: milissegundos, total, erro }]
export function GraficoBarras({ pontos, formatarX, rotuloFim, rotulo, dica, altura = 150, semDados }) {
    const [ref, largura] = useLargura()
    const [ativo, setAtivo] = useState(null)

    if (!pontos?.length || pontos.every((p) => !p.total)) {
        return <div className="grafico" ref={ref}><div className="grafico--vazio" style={{ height: altura }}>{semDados}</div></div>
    }

    if (!largura) return <div className="grafico" ref={ref} style={{ height: altura }} />

    const w = largura
    const h = altura
    const topo = Math.max(...pontos.map((p) => p.total)) * 1.1 || 1
    const passo = (w - MARGEM.esquerda - MARGEM.direita) / pontos.length
    // 2px de espaço entre barras; barras finas quando há muitos pontos.
    const larguraBarra = Math.max(passo - 2, 1)
    const altUtil = h - MARGEM.topo - MARGEM.base
    const sy = (v) => (v / topo) * altUtil
    const baseY = h - MARGEM.base
    const ponto = ativo !== null ? pontos[ativo] : null

    function aoMover(e) {
        const caixa = e.currentTarget.getBoundingClientRect()
        const px = ((e.clientX - caixa.left) / caixa.width) * w
        setAtivo(Math.min(Math.max(Math.floor((px - MARGEM.esquerda) / passo), 0), pontos.length - 1))
    }

    function aoTeclar(e) {
        if (e.key === 'ArrowRight') setAtivo((i) => Math.min((i ?? -1) + 1, pontos.length - 1))
        if (e.key === 'ArrowLeft') setAtivo((i) => Math.max((i ?? pontos.length) - 1, 0))
        if (e.key === 'Escape') setAtivo(null)
    }

    return (
        <div className="grafico" ref={ref}>
            <svg width={w} height={h} role="img" aria-label={rotulo} tabIndex={0} onPointerMove={aoMover} onPointerLeave={() => setAtivo(null)} onKeyDown={aoTeclar} onBlur={() => setAtivo(null)}>
                {[0.5, 1].map((f) => (
                    <line key={f} className="grafico__grade" x1={MARGEM.esquerda} x2={w - MARGEM.direita} y1={baseY - altUtil * f / 1.1} y2={baseY - altUtil * f / 1.1} />
                ))}
                {pontos.map((p, i) => {
                    const x = MARGEM.esquerda + i * passo + 1
                    const hTotal = sy(p.total)
                    const hErro = sy(p.erro ?? 0)
                    const raio = Math.min(2, larguraBarra / 2)
                    return (
                        <g key={p.x} className={ativo === i ? 'is-ativo' : undefined}>
                            {hTotal - hErro > 0 && <rect className="grafico__barra" x={x} y={baseY - hTotal + hErro} width={larguraBarra} height={hTotal - hErro} rx={raio} />}
                            {hErro > 0 && <rect className="grafico__barra grafico__barra--erro" x={x} y={baseY - hTotal} width={larguraBarra} height={Math.max(hErro, 1.5)} rx={raio} />}
                        </g>
                    )
                })}
                <line className="grafico__base" x1={MARGEM.esquerda} x2={w - MARGEM.direita} y1={baseY} y2={baseY} />
                <text className="grafico__eixo" x={MARGEM.esquerda} y={h - 6}>{formatarX(pontos[0].x)}</text>
                <text className="grafico__eixo" x={w / 2} y={h - 6} textAnchor="middle">{formatarX(pontos[Math.floor(pontos.length / 2)].x)}</text>
                <text className="grafico__eixo" x={w - MARGEM.direita} y={h - 6} textAnchor="end">{rotuloFim ?? formatarX(pontos[pontos.length - 1].x)}</text>
            </svg>
            {ponto && (
                <div className="grafico__dica" style={{ left: Math.min(Math.max(MARGEM.esquerda + ativo * passo + passo / 2, 80), w - 80) }} role="status">
                    <strong>{dica(ponto)}</strong>
                    <span>{formatarX(ponto.x)}</span>
                </div>
            )}
        </div>
    )
}

export default GraficoBarras
