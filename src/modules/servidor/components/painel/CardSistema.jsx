import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeServidor } from '@/components/Icones/Icones'
import { formatarMoeda } from '@/i18n/formatar'

export function CardSistema({ servidor: s }) {
    const { t, idioma } = useIdioma()
    const [aberto, setAberto] = useState(false)
    const lista = s.pacotes?.lista ?? []
    const seguranca = lista.filter((p) => p.seguranca)
    const outras = lista.filter((p) => !p.seguranca)
    const verificado = !!s.pacotes?.verificadoEm

    return (
        <section className="card bloco" style={{ '--i': 7 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeServidor />{t('servidor.so.titulo')}</h2>
                {verificado && <span className={`badge badge--${seguranca.length ? 'danger' : lista.length ? 'warning' : 'success'}`}>{lista.length ? t('servidor.so.pacotes', { n: lista.length }) : t('servidor.so.emDia')}</span>}
            </div>

            {(s.custo?.valor != null || s.custo?.provedor) && (
                <p className="custo-servidor">
                    <span>{t('servidor.so.custo')}</span>
                    <strong className="mono">{s.custo?.valor != null ? `${formatarMoeda(s.custo.valor, s.custo.moeda, idioma)}${t('servidor.so.porMes')}` : '—'}</strong>
                    {s.custo?.provedor && <span className="texto-pequeno">{s.custo.provedor}</span>}
                </p>
            )}

            {!verificado ? (
                <p className="texto-suave">{t('servidor.so.semInventario')}</p>
            ) : (
                <>
                    {s.sistema?.so && <p className="texto-pequeno">{s.sistema.so} · kernel {s.sistema.kernel} · {s.sistema.arquitetura}</p>}
                    <ul className="linhas">
                        <li><span>{t('servidor.so.seguranca')}</span><strong className="mono" data-tom={seguranca.length ? 'danger' : undefined}>{seguranca.length}</strong></li>
                        <li><span>{t('servidor.so.outras')}</span><strong className="mono">{outras.length}</strong></li>
                        <li><span>{t('servidor.so.reinicio')}</span><strong className="mono" data-tom={s.pacotes.reinicioNecessario ? 'warning' : 'success'}>{s.pacotes.reinicioNecessario ? t('comum.sim') : t('comum.nao')}</strong></li>
                    </ul>

                    {lista.length > 0 && (
                        <details className="pacotes" open={aberto} onToggle={(e) => setAberto(e.currentTarget.open)}>
                            <summary>{t('servidor.so.verPacotes')}</summary>
                            <ul className="pacotes__lista">
                                {[...seguranca, ...outras].map((p, i) => (
                                    <li key={`${p.nome}-${i}`}>
                                        <span className="mono">{p.nome}</span>
                                        <span className="mono texto-pequeno">{p.atual ?? ''} → {p.nova}</span>
                                        {p.seguranca && <span className="badge badge--danger">{t('servidor.deps.filtro.seguranca')}</span>}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}

                    {(s.versoes ?? []).length > 0 && (
                        <>
                            <h3 className="bloco__subtitulo">{t('servidor.so.versoes')}</h3>
                            <ul className="versoes">
                                {s.versoes.map((v) => <li key={v.nome}><span>{v.nome}</span><strong className="mono">{v.versao}</strong></li>)}
                            </ul>
                        </>
                    )}
                </>
            )}
        </section>
    )
}

export default CardSistema
