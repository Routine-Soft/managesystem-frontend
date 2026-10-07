import { useIdioma } from '@/i18n/useIdioma'
import { formatarBytes, formatarData, formatarDuracao, formatarPct, formatarRelativo } from '@/i18n/formatar'
import BarrasDisponibilidade from '@/components/graficos/BarrasDisponibilidade'
import { TOM_DO_STATUS, minutosLegiveis, resumoDoSistema } from '../../servidor.utils'

// Está no ar? Há quanto tempo? Disponibilidade dos últimos 30 dias, quedas e lentidões.
export function CardStatus({ servidor: s, disponibilidade, incidentes, agora }) {
    const { t, idioma } = useIdioma()
    const tempoNoAr = s.sistema?.bootEm && s.status !== 'offline' ? agora - new Date(s.sistema.bootEm).getTime() : null
    const pctDisp = disponibilidade?.pct
    const v = s.ultimaVerificacao

    return (
        <section className="card bloco painel-status" style={{ '--i': 0 }}>
            <div className="bloco__cabecalho">
                <span className={`badge badge--${TOM_DO_STATUS[s.status]}${s.status === 'online' ? ' badge--live' : ''}`}>{t(`servidor.status.${s.status}`)}</span>
                <span className="texto-pequeno">{resumoDoSistema(s.sistema, t, formatarBytes, idioma) ?? ''}</span>
            </div>

            <span className="painel-status__rotulo">{t('servidor.tempoNoAr')}</span>
            <strong className="painel-status__uptime mono">{tempoNoAr ? formatarDuracao(tempoNoAr) : '—'}</strong>

            <div className="painel-status__disp">
                <span>{t('servidor.disponibilidade')}</span>
                <strong className="mono" data-tom={pctDisp === null || pctDisp === undefined ? undefined : pctDisp >= 99.5 ? 'success' : pctDisp >= 98 ? 'warning' : 'danger'}>
                    {formatarPct(pctDisp, idioma, 2)}
                </strong>
            </div>
            <BarrasDisponibilidade
                dias={disponibilidade?.dias ?? []}
                rotulo={t('servidor.disponibilidade')}
                rotuloDoDia={(d) => {
                    const dia = formatarData(`${d.dia}T12:00:00`, idioma, { day: '2-digit', month: 'short' })
                    const estado = t(`servidor.estadoDia.${d.estado}`)
                    return d.pct === null ? `${dia}: ${estado}` : `${dia}: ${estado} · ${formatarPct(d.pct, idioma, 2)}`
                }}
            />
            <ul className="legenda">
                <li><i />{t('servidor.operacional')}</li>
                <li><i style={{ '--cor': 'var(--danger)' }} />{t('servidor.quedasLegenda', { n: incidentes.quedas30d, min: minutosLegiveis(incidentes.minutosFora30d) })}</li>
                <li><i style={{ '--cor': 'var(--warning)' }} />{t('servidor.lentidoesLegenda', { n: incidentes.lentidoes30d })}</li>
            </ul>

            <p className="painel-status__rodape texto-pequeno">
                {s.url
                    ? v?.em && (v.ok ? t('servidor.ultimaResposta', { ms: v.ms, status: v.statusHttp }) : t('servidor.ultimaFalha', { erro: v.erro ?? '' }))
                    : t('servidor.semUrl')}
                {s.agente?.ultimoContato && <> · {t('servidor.agenteDesde', { versao: s.agente.versao ?? '', quando: formatarRelativo(s.agente.ultimoContato, idioma, agora) })}</>}
            </p>
        </section>
    )
}

export default CardStatus
