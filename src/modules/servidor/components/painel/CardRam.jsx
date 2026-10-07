import { useIdioma } from '@/i18n/useIdioma'
import { formatarBytes, formatarDataHora, formatarHora, formatarPct } from '@/i18n/formatar'
import Anel from '@/components/graficos/Anel'
import GraficoArea from '@/components/graficos/GraficoArea'
import { IconeMemoria } from '@/components/Icones/Icones'
import { pct, tomDoUso } from '../../servidor.utils'
import SeletorPeriodo from './SeletorPeriodo'

export function CardRam({ servidor: s, serie, picoRam24h, periodo, setPeriodo }) {
    const { t, idioma } = useIdioma()
    const total = s.atual?.ramTotal ?? s.sistema?.ramTotal
    const usada = s.atual?.ramUsada
    const uso = pct(usada, total)
    const tom = tomDoUso(uso)
    const selo = tom === 'danger' ? 'critico' : tom === 'warning' ? 'alto' : 'normal'
    const curto = periodo === '1h' || periodo === '24h'
    const formatarX = (x) => (curto ? formatarHora(x, idioma) : formatarDataHora(x, idioma))

    return (
        <section className="card bloco" style={{ '--i': 1 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeMemoria />{t('servidor.ram.titulo')}</h2>
                {uso !== null && <span className={`badge badge--${tom === 'success' ? 'info' : tom}`}>{t(`servidor.ram.${selo}`)}</span>}
            </div>

            <div className="ram">
                <Anel pct={uso} tom={tom} rotulo={`${t('servidor.ram.titulo')} ${formatarPct(uso, idioma)}`} />
                <dl className="ram__numeros">
                    <div><dt>{t('servidor.ram.emUso')}</dt><dd className="mono">{formatarBytes(usada, idioma)}</dd></div>
                    <div><dt>{t('servidor.ram.livre')}</dt><dd className="mono">{total && usada !== undefined ? formatarBytes(total - usada, idioma) : '—'}</dd></div>
                    <div><dt>{t('servidor.ram.total')}</dt><dd className="mono">{formatarBytes(total, idioma, 0)}</dd></div>
                    <div><dt>{t('servidor.ram.pico')}</dt><dd className="mono">{formatarBytes(picoRam24h?.valor, idioma)}</dd></div>
                </dl>
            </div>

            <div className="bloco__subcabecalho">
                <SeletorPeriodo periodo={periodo} setPeriodo={setPeriodo} />
            </div>
            <GraficoArea
                pontos={serie.map((p) => ({ x: new Date(p.em).getTime(), y: p.ramUsada }))}
                yMax={total}
                formatarY={(y) => `${formatarBytes(y, idioma)} · ${formatarPct(pct(y, total), idioma)}`}
                formatarX={formatarX}
                rotuloFim={t('servidor.agora')}
                rotulo={t('servidor.ram.titulo')}
                semDados={t('comum.semDados')}
            />
        </section>
    )
}

export default CardRam
