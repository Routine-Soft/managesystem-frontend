import { useEffect, useMemo, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { useLargura } from './useLargura'
import { SIGLA_DO_NOME, SIGLA_DO_NUMERICO } from './mapa.paises'

// 5 tons de uma cor só (do claro ao escuro): quanto mais acessos, mais escuro. País sem acesso fica neutro.
const TONS = [24, 42, 60, 78, 96]
const corDoTom = (i) => `color-mix(in oklab, var(--primary) ${TONS[i]}%, var(--surface-2))`

function tomDe(n, maximo) {
    if (!n || !maximo) return null
    return Math.min(TONS.length - 1, Math.floor((Math.sqrt(n) / Math.sqrt(maximo)) * TONS.length * 0.999))
}

// Mapa do mundo pintado por país. `valores` é { BR: 120, PT: 30, ... }; a dica mostra o que `dica(sigla, n)` devolver.
export function MapaMundi({ valores, rotulo, dica, legendaMenos, legendaMais }) {
    const [ref, largura] = useLargura()
    const [paises, setPaises] = useState(null)
    const [ativo, setAtivo] = useState(null)

    // O desenho dos países (~100 KB) só é baixado quando o mapa aparece.
    useEffect(() => {
        let ignore = false
        Promise.all([import('world-atlas/countries-110m.json'), import('topojson-client')])
            .then(([mundo, topojson]) => {
                if (ignore) return
                const todos = topojson.feature(mundo.default ?? mundo, (mundo.default ?? mundo).objects.countries).features
                setPaises(todos.filter((f) => f.id !== '010').map((f) => ({ ...f, sigla: SIGLA_DO_NUMERICO[f.id] ?? SIGLA_DO_NOME[f.properties?.name] ?? null })))
            })
            .catch(() => null)
        return () => {
            ignore = true
        }
    }, [])

    const altura = Math.round(largura * 0.5)
    const caminho = useMemo(() => {
        if (!paises || !largura) return null
        const projecao = geoNaturalEarth1().fitSize([largura, altura], { type: 'FeatureCollection', features: paises })
        return geoPath(projecao)
    }, [paises, largura, altura])

    const maximo = Math.max(0, ...Object.values(valores ?? {}))

    return (
        <div className="mapa" ref={ref}>
            {caminho ? (
                <svg width={largura} height={altura} role="img" aria-label={rotulo} onMouseLeave={() => setAtivo(null)}>
                    {paises.map((f, i) => {
                        const n = f.sigla ? valores?.[f.sigla] ?? 0 : 0
                        const tom = tomDe(n, maximo)
                        return (
                            <path
                                key={`${f.id ?? f.properties?.name}-${i}`}
                                d={caminho(f)}
                                className={`mapa__pais${n ? ' mapa__pais--com' : ''}${ativo?.sigla === f.sigla && f.sigla ? ' is-ativo' : ''}`}
                                style={tom === null ? undefined : { fill: corDoTom(tom) }}
                                onMouseMove={(e) => {
                                    if (!f.sigla) return
                                    const caixa = e.currentTarget.ownerSVGElement.getBoundingClientRect()
                                    setAtivo({ sigla: f.sigla, n, x: e.clientX - caixa.left, y: e.clientY - caixa.top })
                                }}
                                onClick={(e) => {
                                    if (!f.sigla) return
                                    const caixa = e.currentTarget.ownerSVGElement.getBoundingClientRect()
                                    setAtivo({ sigla: f.sigla, n, x: e.clientX - caixa.left, y: e.clientY - caixa.top })
                                }}
                            />
                        )
                    })}
                </svg>
            ) : (
                <div className="skeleton" style={{ height: Math.max(altura, 120) }} />
            )}

            {ativo && (
                <div className="grafico__dica mapa__dica" style={{ left: Math.min(Math.max(ativo.x, 90), largura - 90), top: Math.max(ativo.y - 54, 0) }} role="status">
                    {dica(ativo.sigla, ativo.n)}
                </div>
            )}

            <div className="mapa__legenda" aria-hidden="true">
                <span>{legendaMenos}</span>
                {TONS.map((_, i) => <i key={i} style={{ background: corDoTom(i) }} />)}
                <span>{legendaMais}</span>
            </div>
        </div>
    )
}

export default MapaMundi
