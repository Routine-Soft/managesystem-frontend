import { useIdioma } from '@/i18n/useIdioma'
import { formatarDataHora } from '@/i18n/formatar'
import { IconeAlerta } from '@/components/Icones/Icones'
import { minutosLegiveis } from '../../servidor.utils'

export function CardOcorrencias({ incidentes, agora }) {
    const { t, idioma } = useIdioma()
    const lista = incidentes.lista ?? []
    return (
        <section className="card bloco" style={{ '--i': 10 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeAlerta />{t('servidor.ocorrencias.titulo')}</h2>
            </div>
            {lista.length === 0 ? (
                <p className="texto-suave">{t('servidor.ocorrencias.vazio')}</p>
            ) : (
                <ul className="linhas">
                    {lista.slice(0, 10).map((inc) => {
                        const minutos = Math.round(((inc.fim ? new Date(inc.fim).getTime() : agora) - new Date(inc.inicio).getTime()) / 60000)
                        return (
                            <li key={inc._id}>
                                <span>
                                    <span className={`badge badge--${inc.tipo === 'queda' ? 'danger' : 'warning'}`}>{t(`servidor.ocorrencias.${inc.tipo}`)}</span>{' '}
                                    <span className="texto-pequeno">{formatarDataHora(inc.inicio, idioma)}{inc.motivo ? ` · ${inc.motivo}` : ''}</span>
                                </span>
                                <strong className="texto-pequeno">
                                    {inc.fim ? t('servidor.ocorrencias.duracao', { min: minutosLegiveis(minutos) }) : t('servidor.ocorrencias.emAndamento')}
                                </strong>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

export default CardOcorrencias
