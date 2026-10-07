import { useIdioma } from '@/i18n/useIdioma'
import BotaoCopiar from '@/components/Copiar/BotaoCopiar'
import { IconeEscudo } from '@/components/Icones/Icones'

// Passo a passo para instalar o agente, com o comando pronto para copiar.
export function ComandoInstalacao({ comando, comandoRemocao, aguardando = false }) {
    const { t } = useIdioma()
    return (
        <div className="instalacao">
            <ol className="instalacao__passos">
                <li>{t('servidor.instalar.passo1')}</li>
                <li>{t('servidor.instalar.passo2')}</li>
            </ol>

            {comando && (
                <div className="comando">
                    <pre aria-label={t('servidor.comandoInstalacao')}>{comando}</pre>
                    <div className="comando__acoes">
                        <span className="texto-pequeno">{t('servidor.instalar.soUmaVez')}</span>
                        <BotaoCopiar texto={comando} className="btn btn--primary btn--sm" />
                    </div>
                </div>
            )}

            <ol className="instalacao__passos" start={3}>
                <li>{t('servidor.instalar.passo3')}</li>
            </ol>

            {aguardando && (
                <p className="instalacao__aguardando" role="status">
                    <span className="instalacao__pulso" aria-hidden="true" />
                    {t('servidor.instalar.aguardando')}
                </p>
            )}

            <p className="instalacao__nota"><IconeEscudo />{t('servidor.instalar.seguranca')}</p>
            <p className="texto-pequeno">{t('servidor.instalar.requisitos')}</p>

            {comandoRemocao && (
                <details className="instalacao__remover">
                    <summary>{t('servidor.instalar.remover')}</summary>
                    <div className="comando">
                        <pre>{comandoRemocao}</pre>
                        <div className="comando__acoes"><span /><BotaoCopiar texto={comandoRemocao} /></div>
                    </div>
                </details>
            )}
        </div>
    )
}

export default ComandoInstalacao
