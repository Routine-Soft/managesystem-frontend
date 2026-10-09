import { Link } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarBytes, formatarRelativo, diasAte, formatarPct } from '@/i18n/formatar'
import Medidor from '@/components/graficos/Medidor'
import { IconeCadeado, IconeEscudo } from '@/components/Icones/Icones'
import { TOM_DO_STATUS, hostDaUrl, pct, resumoDoSistema, tomDoUso, tomDosDias } from '../servidor.utils'

// Cartão do servidor na visão geral: status, uso de CPU/RAM/disco e o que pede atenção.
export function ServidorCard({ servidor: s, indice, agora }) {
    const { t, idioma } = useIdioma()
    const ram = pct(s.atual?.ramUsada, s.atual?.ramTotal)
    const disco = pct(s.atual?.discoUsado, s.atual?.discoTotal)
    const diasSsl = diasAte(s.ssl?.expiraEm, agora)
    const seguranca = (s.pendencias?.sistemaSeguranca ?? 0) + (s.pendencias?.dependenciasVulneraveis ?? 0)
    const medidas = [
        { rotulo: 'CPU', valor: s.atual?.cpu },
        { rotulo: 'RAM', valor: ram },
        { rotulo: t('servidor.disco.titulo'), valor: disco },
    ]

    return (
        <Link to={`/servidores/${s._id}`} className="card servidor-card" style={{ '--i': indice }} data-status={s.status}>
            <header className="servidor-card__topo">
                <div className="servidor-card__nome">
                    <span className="tipo-card">{t('comum.tipoServidor')}</span>
                    <strong>{s.nome}</strong>
                    <span>{s.url ? hostDaUrl(s.url) : resumoDoSistema(s.sistema, t, formatarBytes, idioma) ?? '—'}</span>
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
                        </li>
                    ))}
                </ul>
            )}

            <footer className="servidor-card__rodape">
                {diasSsl !== null && (
                    <span className={`badge badge--${tomDosDias(diasSsl)}`}><IconeCadeado />SSL {t('servidor.dominioSsl.dias', { dias: diasSsl })}</span>
                )}
                {seguranca > 0 && <span className="badge badge--danger"><IconeEscudo />{t('servidor.deps.vulneraveis', { n: seguranca })}</span>}
                <span className="servidor-card__quando">{s.agente?.ultimoContato ? formatarRelativo(s.agente.ultimoContato, idioma, agora) : t('servidor.semContato')}</span>
            </footer>
        </Link>
    )
}

export default ServidorCard
