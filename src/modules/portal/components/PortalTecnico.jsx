import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeServidor } from '@/components/Icones/Icones'
import { useAgora } from '@/modules/servidor/servidor.hooks'
import CardRam from '@/modules/servidor/components/painel/CardRam'
import CardCpuDisco from '@/modules/servidor/components/painel/CardCpuDisco'
import CardRequisicoes from '@/modules/servidor/components/painel/CardRequisicoes'
import CardMapa from '@/modules/servidor/components/painel/CardMapa'
import CardContainers from '@/modules/servidor/components/painel/CardContainers'
import CardOcorrencias from '@/modules/servidor/components/painel/CardOcorrencias'
import CardDependencias from '@/modules/servidor/components/painel/CardDependencias'
import CardSistema from '@/modules/servidor/components/painel/CardSistema'
import CardLogs from '@/modules/servidor/components/painel/CardLogs'
import CardHistorico from '@/modules/servidor/components/painel/CardHistorico'
import { usePainelDoServidorNoPortal } from '../portal.hooks'
import '@/modules/servidor/components/servidor.css'

function Esqueleto() {
    return (
        <div className="painel-grade" aria-busy="true">
            {[0, 1].map((i) => (
                <div key={i} className="card bloco">
                    <div className="skeleton skeleton--line" style={{ width: '40%' }} />
                    <div className="skeleton skeleton--line" style={{ width: '70%', height: 40 }} />
                    <div className="skeleton skeleton--line" />
                </div>
            ))}
        </div>
    )
}

// Os mesmos cartões do painel do programador, só para ver (sem ações nem custo do servidor).
function DetalhesDoServidor({ servidor, mostrarNome }) {
    const { t } = useIdioma()
    const [periodo, setPeriodo] = useState('24h')
    const { dados, erro } = usePainelDoServidorNoPortal(servidor._id, periodo)
    const agora = useAgora(5000)
    const s = dados?.servidor

    return (
        <div className="portal-tecnico__servidor">
            {mostrarNome && <h3 className="portal-tecnico__nome"><IconeServidor />{servidor.nome}</h3>}
            {erro && !dados ? (
                <p className="alert alert--error" role="alert">{erro.message}</p>
            ) : !s ? <Esqueleto /> : (
                <div className="painel-grade">
                    <div className="painel-coluna">
                        {/* Sistema em container: só o container dele (nunca os outros da máquina). */}
                        {s.containerAtual && !s.agente?.ultimoContato ? (
                            <CardContainers servidor={{ containers: [s.containerAtual] }} agora={agora} titulo={t('servidor.containers.doServidor')} />
                        ) : (
                            <>
                                <CardRam servidor={s} serie={dados.serie} picoRam24h={dados.picoRam24h} periodo={periodo} setPeriodo={setPeriodo} />
                                <CardCpuDisco servidor={s} />
                            </>
                        )}
                        <CardMapa paises={dados.paises} periodo={periodo} />
                        <CardRequisicoes serie={dados.serie} periodo={periodo} />
                        <CardOcorrencias incidentes={dados.incidentes} agora={agora} />
                    </div>
                    <div className="painel-coluna">
                        <CardDependencias servidor={s} agora={agora} />
                        <CardSistema servidor={s} mostrarAcoes={false} />
                        <CardLogs servidor={s} />
                        <CardHistorico eventos={dados.eventos} />
                    </div>
                </div>
            )}
        </div>
    )
}

export function PortalTecnico({ servidores }) {
    const { t } = useIdioma()
    if (!servidores.length) return null
    return (
        <section className="portal-tecnico">
            <header className="portal-tecnico__cabecalho">
                <h2 className="bloco__titulo">{t('portal.tecnico.titulo')}</h2>
                <p className="texto-suave">{t('portal.tecnico.subtitulo')}</p>
            </header>
            {servidores.map((s) => <DetalhesDoServidor key={s._id} servidor={s} mostrarNome={servidores.length > 1} />)}
        </section>
    )
}

export default PortalTecnico
