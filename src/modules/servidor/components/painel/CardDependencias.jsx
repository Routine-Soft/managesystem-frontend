import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarRelativo } from '@/i18n/formatar'
import { IconeCaixa } from '@/components/Icones/Icones'
import { filtrarDependencias } from '../../servidor.utils'

const VISIVEIS = 4
const FILTROS = ['todas', 'seguranca', 'maior', 'menor', 'correcao']
const TOM_DO_SALTO = { maior: 'warning', menor: 'info', correcao: 'success', outro: 'neutro' }

// Etiquetas: falha de segurança (npm audit), categoria do pacote e tamanho do salto de versão.
function Etiquetas({ d }) {
    const { t } = useIdioma()
    const categoria = d.categoria ? t(`servidor.deps.categoria.${d.categoria}`) : null
    return (
        <span className="dep__etiquetas">
            {d.vulneravel && <span className="badge badge--danger">{t('servidor.deps.vulneravel', { sev: t(`servidor.deps.severidade.${d.severidade}`) })}</span>}
            {categoria && <span className={`badge badge--${d.categoria === 'seguranca' ? 'danger' : 'violet'}`}>{categoria}</span>}
            <span className={`badge badge--${TOM_DO_SALTO[d.salto] ?? 'neutro'}`}>{t(`servidor.deps.salto.${d.salto}`)}</span>
            {d.dev && <span className="badge badge--neutro">{t('servidor.deps.dev')}</span>}
        </span>
    )
}

export function CardDependencias({ servidor: s, agora }) {
    const { t, idioma } = useIdioma()
    const [filtro, setFiltro] = useState('todas')
    const [todas, setTodas] = useState(false)
    const deps = s.dependencias ?? []
    const lista = filtrarDependencias(deps, filtro)
    const visiveis = todas ? lista : lista.slice(0, VISIVEIS)
    const contagem = {
        vulneraveis: deps.filter((d) => d.vulneravel).length,
        maiores: deps.filter((d) => d.salto === 'maior').length,
        menores: deps.filter((d) => d.salto === 'menor').length,
        correcoes: deps.filter((d) => d.salto === 'correcao').length,
    }
    const projetosComErro = (s.projetos ?? []).filter((p) => p.erro)
    const variosProjetos = new Set(deps.map((d) => d.projeto)).size > 1

    return (
        <section className="card bloco" style={{ '--i': 6 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeCaixa />{t('servidor.deps.titulo')}</h2>
                {s.dependenciasVerificadasEm && (
                    <span className={`badge badge--${contagem.vulneraveis ? 'danger' : deps.length ? 'warning' : 'success'}`}>
                        {deps.length ? t('servidor.deps.pendentes', { n: deps.length }) : t('servidor.deps.emDia')}
                    </span>
                )}
            </div>

            {s.dependenciasVerificadasEm && <p className="texto-pequeno">{t('servidor.deps.verificadoEm', { quando: formatarRelativo(s.dependenciasVerificadasEm, idioma, agora) })}</p>}

            {!s.dependenciasVerificadasEm ? (
                <p className="texto-suave">{t('servidor.so.semInventario')}</p>
            ) : !(s.projetos ?? []).length ? (
                <p className="texto-suave">{t('servidor.deps.semProjetos')}</p>
            ) : deps.length === 0 ? (
                <p className="texto-suave">{t('servidor.deps.semPendencias')}</p>
            ) : (
                <>
                    <ul className="legenda">
                        {contagem.vulneraveis > 0 && <li><i style={{ '--cor': 'var(--danger)' }} />{t('servidor.deps.vulneraveis', { n: contagem.vulneraveis })}</li>}
                        {contagem.maiores > 0 && <li><i style={{ '--cor': 'var(--warning)' }} />{t('servidor.deps.maiores', { n: contagem.maiores })}</li>}
                        {contagem.menores > 0 && <li><i style={{ '--cor': 'var(--info)' }} />{t('servidor.deps.menores', { n: contagem.menores })}</li>}
                        {contagem.correcoes > 0 && <li><i />{t('servidor.deps.correcoes', { n: contagem.correcoes })}</li>}
                    </ul>

                    <div className="pilulas deps__filtros" role="group" aria-label={t('servidor.deps.filtroRotulo')}>
                        {FILTROS.map((f) => (
                            <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>{t(`servidor.deps.filtro.${f}`)}</button>
                        ))}
                    </div>

                    <ul className="linhas deps">
                        {visiveis.map((d, i) => (
                            <li key={`${d.projeto}:${d.nome}`} className="dep" style={{ '--i': i }}>
                                <span className="dep__info">
                                    <strong className="mono">{d.nome}</strong>
                                    <span className="mono texto-pequeno">{d.atual} → {d.nova ?? '?'}{variosProjetos && <> · {d.projeto}</>}</span>
                                </span>
                                <Etiquetas d={d} />
                            </li>
                        ))}
                    </ul>

                    {lista.length > VISIVEIS && (
                        <button type="button" className="btn btn--ghost btn--block" onClick={() => setTodas(!todas)}>
                            {todas ? t('comum.verMenos') : t('servidor.deps.verTodas', { n: lista.length })}
                        </button>
                    )}
                    <p className="texto-pequeno deps__legenda">{t('servidor.deps.legendaSalto')}</p>
                </>
            )}

            {projetosComErro.map((p) => (
                <p key={p.caminho} className="alert alert--warning">{t('servidor.deps.projetoErro', { projeto: p.nome, erro: p.erro })}</p>
            ))}
        </section>
    )
}

export default CardDependencias
