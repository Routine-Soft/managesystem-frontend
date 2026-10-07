import { useState } from 'react'
import { useLargura } from './useLargura'
import './graficos.css'

const MARGEM = { topo: 12, direita: 10, base: 24, esquerda: 10 }

// Gráfico de área de uma série só (ex.: RAM nas últimas 24 h), com linha-guia e dica ao passar o mouse.
// pontos: [{ x: milissegundos, y: número }]. Intervalos sem leitura maiores que `buraco` quebram a linha.
export function GraficoArea({ pontos, yMax, formatarY, formatarX, rotuloFim, rotulo, altura = 150, buraco, semDados }) {
    const [ref, largura] = useLargura()
    const [ativo, setAtivo] = useState(null)

    if (!pontos || pontos.length < 2) {
        return <div className="grafico" ref={ref}><div className="grafico--vazio" style={{ height: altura }}>{semDados}</div></div>
    }

    if (!largura) return <div className="grafico" ref={ref} style={{ height: altura }} />

    const w = largura
    const h = altura
    const x0 = pontos[0].x
    const x1 = pontos[pontos.length - 1].x
    const topo = yMax ?? (Math.max(...pontos.map((p) => p.y ?? 0)) * 1.15 || 1)
    const sx = (x) => MARGEM.esquerda + ((x - x0) / Math.max(x1 - x0, 1)) * (w - MARGEM.esquerda - MARGEM.direita)
    const sy = (y) => MARGEM.topo + (1 - Math.min(y, topo) / topo) * (h - MARGEM.topo - MARGEM.base)
    const baseY = h - MARGEM.base
    const limiteBuraco = buraco ?? ((x1 - x0) / pontos.length) * 3

    // Segmentos contínuos (sem buracos).
    const segmentos = []
    let atual = []
    pontos.forEach((p, i) => {
        if (p.y === null || p.y === undefined) return
        if (atual.length && p.x - pontos[i - 1].x > limiteBuraco) {
            segmentos.push(atual)
            atual = []
        }
        atual.push(p)
    })
    if (atual.length) segmentos.push(atual)

    const linha = (seg) => seg.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('')
    const area = (seg) => `${linha(seg)}L${sx(seg[seg.length - 1].x).toFixed(1)},${baseY}L${sx(seg[0].x).toFixed(1)},${baseY}Z`

    function aoMover(e) {
        const caixa = e.currentTarget.getBoundingClientRect()
        const px = ((e.clientX - caixa.left) / caixa.width) * w
        let melhor = 0
        pontos.forEach((p, i) => {
            if (Math.abs(sx(p.x) - px) < Math.abs(sx(pontos[melhor].x) - px)) melhor = i
        })
        setAtivo(melhor)
    }

    function aoTeclar(e) {
        if (e.key === 'ArrowRight') setAtivo((i) => Math.min((i ?? -1) + 1, pontos.length - 1))
        if (e.key === 'ArrowLeft') setAtivo((i) => Math.max((i ?? pontos.length) - 1, 0))
        if (e.key === 'Escape') setAtivo(null)
    }

    const ponto = ativo !== null ? pontos[ativo] : null
    const meio = pontos[Math.floor(pontos.length / 2)]

    return (
        <div className="grafico" ref={ref}>
            <svg
                width={w}
                height={h}
                role="img"
                aria-label={rotulo}
                tabIndex={0}
                onPointerMove={aoMover}
                onPointerLeave={() => setAtivo(null)}
                onKeyDown={aoTeclar}
                onBlur={() => setAtivo(null)}
            >
                {[0, 0.5, 1].map((f) => (
                    <line key={f} className="grafico__grade" x1={MARGEM.esquerda} x2={w - MARGEM.direita} y1={sy(topo * f)} y2={sy(topo * f)} />
                ))}
                {segmentos.map((seg) => (
                    <g key={seg[0].x}>
                        <path className="grafico__area" d={area(seg)} />
                        <path className="grafico__linha" d={linha(seg)} />
                    </g>
                ))}
                <text className="grafico__eixo" x={MARGEM.esquerda} y={h - 6}>{formatarX(x0)}</text>
                <text className="grafico__eixo" x={w / 2} y={h - 6} textAnchor="middle">{formatarX(meio.x)}</text>
                <text className="grafico__eixo" x={w - MARGEM.direita} y={h - 6} textAnchor="end">{rotuloFim ?? formatarX(x1)}</text>
                {ponto && ponto.y !== null && ponto.y !== undefined && (
                    <g>
                        <line className="grafico__guia" x1={sx(ponto.x)} x2={sx(ponto.x)} y1={MARGEM.topo} y2={baseY} />
                        <circle className="grafico__ponto" cx={sx(ponto.x)} cy={sy(ponto.y)} r="5" />
                    </g>
                )}
            </svg>
            {ponto && ponto.y !== null && ponto.y !== undefined && (
                <div className="grafico__dica" style={{ left: Math.min(Math.max(sx(ponto.x), 70), w - 70) }} role="status">
                    <strong>{formatarY(ponto.y)}</strong>
                    <span>{formatarX(ponto.x)}</span>
                </div>
            )}
        </div>
    )
}

export default GraficoArea
