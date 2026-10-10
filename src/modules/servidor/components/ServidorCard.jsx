import { Link } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarBytes, formatarMoeda, formatarRelativo, diasAte, formatarPct } from '@/i18n/formatar'
import Medidor from '@/components/graficos/Medidor'
import { IconeCadeado, IconeContainer, IconeEscudo, IconeNuvem } from '@/components/Icones/Icones'
import { TOM_DO_STATUS, convertido, hostDaUrl, pct, resumoDoSistema, tomDoUso, tomDosDias } from '../servidor.utils'

// Cartão do servidor na visão geral: status, uso de CPU/RAM/disco e o que pede atenção.
export function ServidorCard({ servidor: s, indice, agora, moedaPadrao = 'BRL', cotacoes = null }) {
    const { t, idioma } = useIdioma()
    const ram = pct(s.atual?.ramUsada, s.atual?.ramTotal)
    const disco = pct(s.atual?.discoUsado, s.atual?.discoTotal)
    const diasSsl = diasAte(s.ssl?.expiraEm, agora)
    const seguranca = (s.pendencias?.sistemaSeguranca ?? 0) + (s.pendencias?.dependenciasVulneraveis ?? 0)
    // Sistema em container de outro servidor: RAM e CPU vêm do container (o disco é da máquina, fica no cartão dela).
    const c = s.containerAtual
    // Valor em outra moeda (euro, dólar...) aparece também convertido para a moeda da conta, pela cotação atual.
    const emMoedaDaConta = (valor, moeda) => {
        const v = convertido(valor, moeda, moedaPadrao, cotacoes)
        return v === null ? null : <small className="servidor-card__convertido"> ≈ {formatarMoeda(v, moedaPadrao, idioma)}</small>
    }
    // Onde está hospedado (preenchido no cadastro); em container, vale o da máquina se o próprio estiver vazio.
    const provedor = s.custo?.provedor || s.provedorDoHost || null
    const medidas = c
        ? [
            { rotulo: 'CPU', valor: c.cpu },
            { rotulo: 'RAM', valor: pct(c.ramUsada, c.ramLimite), usada: c.ramUsada, total: c.ramLimite },
        ]
        : [
            { rotulo: 'CPU', valor: s.atual?.cpu },
            { rotulo: 'RAM', valor: ram, usada: s.atual?.ramUsada, total: s.atual?.ramTotal },
            { rotulo: t('servidor.disco.titulo'), valor: disco },
        ]

    return (
        <Link to={`/servidores/${s._id}`} className="card servidor-card" style={{ '--i': indice }} data-status={s.status}>
            <header className="servidor-card__topo">
                <div className="servidor-card__nome">
                    <span className="tipo-card">{t('comum.tipoServidor')}</span>
                    <strong>{s.nome}</strong>
                    <span>{s.url ? hostDaUrl(s.url) : resumoDoSistema(s.sistema, t, formatarBytes, idioma) ?? '—'}</span>
                    {provedor && <span className="servidor-card__provedor" title={t('servidor.form.provedor')}><IconeNuvem />{provedor}</span>}
                </div>
                <span className={`badge badge--${TOM_DO_STATUS[s.status]}${s.status === 'online' ? ' badge--live' : ''}`}>{t(`servidor.status.${s.status}`)}</span>
            </header>

            {s.status === 'aguardando' ? (
                <p className="servidor-card__aguardando">{t('servidor.instalar.aguardando')}</p>
            ) : (
                <ul className="servidor-card__medidas">
                    {medidas.map((m) => (
                        <li key={m.rotulo}>
                            <span>{m.rotulo}</span>
                            <Medidor pct={m.valor} tom={tomDoUso(m.valor)} rotulo={`${m.rotulo} ${formatarPct(m.valor, idioma)}`} />
                            <strong className="mono">{formatarPct(m.valor, idioma)}</strong>
                            {m.total ? (
                                <small className="servidor-card__detalhe mono">
                                    {t('servidor.containers.memoria', { usada: formatarBytes(m.usada, idioma, 0), limite: formatarBytes(m.total, idioma, 0) })}
                                </small>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}

            {c && (
                <p className="servidor-card__container texto-pequeno">
                    <IconeContainer />
                    <span>
                        {c.estado === 'ausente' ? t('servidor.containers.ausente') : t('servidor.containers.emHost', { nome: c.nome, host: c.host })}
                    </span>
                </p>
            )}

            {/* O que o cliente paga (itens e total) e o que você paga ao provedor. */}
            <div className="servidor-card__financeiro">
                {(s.mensalidades ?? []).length === 0 ? (
                    <div className="servidor-card__valor">
                        <span>{t('servidor.financeiro.mensalidade')}</span>
                        <strong className="mono">{formatarMoeda(0, moedaPadrao, idioma)}</strong>
                    </div>
                ) : s.mensalidades.map((m) => (
                    <div key={m.cliente} className="servidor-card__mensalidade">
                        <div className="servidor-card__valor">
                            <span>{t('servidor.financeiro.mensalidadeDe', { cliente: m.cliente })}</span>
                            <strong className="mono">{formatarMoeda(m.total, m.moeda, idioma)}{emMoedaDaConta(m.total, m.moeda)}</strong>
                        </div>
                        {m.itens.length > 0 && (
                            <ul className="servidor-card__itens">
                                {m.itens.map((i, n) => <li key={`${i.descricao}-${n}`}><span>{i.descricao}</span><span className="mono">{formatarMoeda(i.valor, m.moeda, idioma)}</span></li>)}
                            </ul>
                        )}
                    </div>
                ))}
                {s.custo?.valor != null && (
                    <div className="servidor-card__valor servidor-card__valor--custo">
                        <span>{s.custo.provedor ? t('servidor.financeiro.seuCustoEm', { provedor: s.custo.provedor }) : t('servidor.financeiro.seuCusto')}</span>
                        <strong className="mono">{formatarMoeda(s.custo.valor, s.custo.moeda, idioma)}{emMoedaDaConta(s.custo.valor, s.custo.moeda)}</strong>
                    </div>
                )}
            </div>

            <footer className="servidor-card__rodape">
                {diasSsl !== null && (
                    <span className={`badge badge--${tomDosDias(diasSsl)}`}><IconeCadeado />SSL {t('servidor.dominioSsl.dias', { dias: diasSsl })}</span>
                )}
                {seguranca > 0 && <span className="badge badge--danger"><IconeEscudo />{t('servidor.deps.vulneraveis', { n: seguranca })}</span>}
                <span className="servidor-card__quando">{s.agente?.ultimoContato ? formatarRelativo(s.agente.ultimoContato, idioma, agora) : c?.em ? formatarRelativo(c.em, idioma, agora) : t('servidor.semContato')}</span>
            </footer>
        </Link>
    )
}

export default ServidorCard
