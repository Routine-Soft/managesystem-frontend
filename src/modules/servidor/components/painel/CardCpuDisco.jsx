import { useIdioma } from '@/i18n/useIdioma'
import { formatarBytes, formatarNumero, formatarPct } from '@/i18n/formatar'
import Medidor from '@/components/graficos/Medidor'
import { pct, tomDoUso } from '../../servidor.utils'

// Dois cartões pequenos lado a lado: CPU e disco.
export function CardCpuDisco({ servidor: s }) {
    const { t, idioma } = useIdioma()
    const cpu = s.atual?.cpu
    const disco = pct(s.atual?.discoUsado, s.atual?.discoTotal)
    return (
        <div className="dupla">
            <section className="card bloco mini" style={{ '--i': 2 }}>
                <span className="mini__rotulo">{t('servidor.cpu.titulo')}</span>
                <strong className="mini__valor mono">{formatarPct(cpu, idioma)}</strong>
                <Medidor pct={cpu} tom={tomDoUso(cpu)} rotulo={t('servidor.cpu.titulo')} />
                <span className="texto-pequeno">{t('servidor.cpu.media', { load: formatarNumero(s.atual?.load1, idioma, 2) })}</span>
            </section>
            <section className="card bloco mini" style={{ '--i': 3 }}>
                <span className="mini__rotulo">{t('servidor.disco.titulo')}</span>
                <strong className="mini__valor mono">{formatarPct(disco, idioma)}</strong>
                <Medidor pct={disco} tom={tomDoUso(disco)} rotulo={t('servidor.disco.titulo')} />
                <span className="texto-pequeno">{t('servidor.disco.de', { usado: formatarBytes(s.atual?.discoUsado, idioma, 0), total: formatarBytes(s.atual?.discoTotal, idioma, 0) })}</span>
            </section>
        </div>
    )
}

export default CardCpuDisco
