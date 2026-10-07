import { Link } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { diasAte, formatarData } from '@/i18n/formatar'
import Medidor from '@/components/graficos/Medidor'
import { IconeGlobo } from '@/components/Icones/Icones'
import { tomDosDias } from '../../servidor.utils'

function SeloDias({ dias }) {
    const { t } = useIdioma()
    if (dias === null) return null
    return <span className={`badge badge--${tomDosDias(dias)}`}>{dias <= 0 ? t('servidor.dominioSsl.vencido') : t('servidor.dominioSsl.faltam', { dias })}</span>
}

export function CardDominioSsl({ servidor: s, site, agora }) {
    const { t, idioma } = useIdioma()
    const expiraDominio = site?.manual?.expiraEm ?? site?.registro?.expiraEm
    const diasDominio = diasAte(expiraDominio, agora)
    const ssl = s.ssl?.expiraEm ? s.ssl : site?.ssl
    const diasSsl = diasAte(ssl?.expiraEm, agora)
    const renovaSozinho = s.certbot?.renovacaoAutomatica

    return (
        <section className="card bloco" style={{ '--i': 5 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeGlobo />{t('servidor.dominioSsl.titulo')}</h2>
            </div>

            {site ? (
                <div className="dominio">
                    <div className="dominio__linha">
                        <div>
                            <span className="texto-pequeno">{t('servidor.dominioSsl.dominio')}</span>
                            <strong className="dominio__nome mono">{site.dominio}</strong>
                            {expiraDominio && <span className="texto-pequeno">{t('servidor.dominioSsl.expiraEm', { data: formatarData(expiraDominio, idioma) })}</span>}
                        </div>
                        <SeloDias dias={diasDominio} />
                    </div>
                    {diasDominio !== null && <Medidor pct={Math.max(0, Math.min(100, ((365 - diasDominio) / 365) * 100))} tom={tomDosDias(diasDominio)} rotulo={t('servidor.dominioSsl.dominio')} />}
                </div>
            ) : (
                <p className="texto-suave dominio__vazio">
                    {t('servidor.dominioSsl.semSite')} <Link className="link" to="/sites">{t('servidor.dominioSsl.cadastrarSite')}</Link>
                </p>
            )}

            <div className="dominio dominio--ssl">
                <div className="dominio__linha">
                    <div>
                        <span className="texto-pequeno">{t('servidor.dominioSsl.ssl')}</span>
                        <strong>{ssl?.emissor ?? (s.url ? '—' : t('servidor.dominioSsl.semSsl'))}</strong>
                        {ssl?.expiraEm && (
                            <span className="texto-pequeno">
                                {t('servidor.dominioSsl.validoAte', { data: formatarData(ssl.expiraEm, idioma) })}
                                {s.certbot?.instalado && <> · {renovaSozinho ? t('servidor.dominioSsl.renovacaoAuto') : t('servidor.dominioSsl.semRenovacaoAuto')}</>}
                            </span>
                        )}
                    </div>
                    {diasSsl !== null && <span className={`badge badge--${tomDosDias(diasSsl)}`}>{t('servidor.dominioSsl.dias', { dias: diasSsl })}</span>}
                </div>
                {ssl?.erro && <p className="alert alert--warning">{t('servidor.dominioSsl.erroSsl', { erro: ssl.erro })}</p>}
            </div>
        </section>
    )
}

export default CardDominioSsl
