import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData, formatarMoeda } from '@/i18n/formatar'
import { IconeMais } from '@/components/Icones/Icones'
import { useFaturas } from '../contratante.hooks'
import { chaveDoStatusDaFatura, tomDaFatura } from '../contratante.utils'

// Faturas de um cliente: gerar a do mês, marcar como paga (recebeu por fora), cancelar ou reabrir.
export function FaturasModal({ contratante, onMudou, onClose }) {
    const { t, idioma } = useIdioma()
    const { faturas, loading, erro, gerar, alterar } = useFaturas(contratante._id)
    const [executando, setExecutando] = useState(null)
    const [erroAcao, setErroAcao] = useState(null)
    const [aviso, setAviso] = useState(null)

    async function executar(chave, acao) {
        setErroAcao(null)
        setAviso(null)
        setExecutando(chave)
        try {
            await acao()
            onMudou?.()
        } catch (e) {
            setErroAcao(e)
        } finally {
            setExecutando(null)
        }
    }

    return (
        <Modal title={t('contratante.faturas.titulo', { nome: contratante.nome })} onClose={onClose} wide>
            {() => (
                <div className="faturas">
                    <div className="faturas__topo">
                        <p className="texto-pequeno">{t('contratante.faturas.explicacao')}</p>
                        <button type="button" className={`btn btn--ghost btn--sm${executando === 'gerar' ? ' btn--loading' : ''}`} disabled={!!executando}
                            onClick={() => executar('gerar', async () => { await gerar(); setAviso(t('contratante.faturas.gerada')) })}>
                            <IconeMais />{t('contratante.faturas.gerarAgora')}
                        </button>
                    </div>

                    {(erro || erroAcao) && <p className="alert alert--error" role="alert">{(erroAcao ?? erro).message}</p>}
                    {aviso && <p className="alert alert--success" role="status">{aviso}</p>}

                    {loading ? (
                        <div aria-busy="true"><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" /></div>
                    ) : faturas.length === 0 ? (
                        <p className="texto-suave">{t('contratante.faturas.nenhuma')}</p>
                    ) : (
                        <ul className="faturas__lista">
                            {faturas.map((f) => (
                                <li key={f._id} className="fatura-linha">
                                    <div className="fatura-linha__info">
                                        <strong className="mono">{formatarMoeda(f.total, f.moeda, idioma)}</strong>
                                        <span className="texto-pequeno">
                                            {t('contratante.faturas.vence', { data: formatarData(f.vencimento, idioma, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }) })}
                                            {f.pagaEm && ` · ${t('contratante.faturas.pagaEm', { data: formatarData(f.pagaEm, idioma) })}`}
                                            {f.pagaManual && ` · ${t('contratante.faturas.manual')}`}
                                        </span>
                                        <span className="texto-pequeno">{f.itens.map((i) => i.descricao).join(' + ')}</span>
                                    </div>
                                    <div className="fatura-linha__lado">
                                        <span className={`badge badge--${tomDaFatura(f)}`}>{t(`contratante.faturas.status.${chaveDoStatusDaFatura(f)}`)}</span>
                                        <div className="fatura-linha__acoes">
                                            {f.status === 'aberta' && (
                                                <>
                                                    <button type="button" className="btn btn--ghost btn--sm" disabled={!!executando} onClick={() => executar(f._id, () => alterar(f._id, 'paga'))}>{t('contratante.faturas.marcarPaga')}</button>
                                                    <button type="button" className="btn btn--ghost btn--sm" disabled={!!executando} onClick={() => executar(f._id, () => alterar(f._id, 'cancelar'))}>{t('comum.cancelar')}</button>
                                                </>
                                            )}
                                            {(f.status === 'cancelada' || (f.status === 'paga' && f.pagaManual)) && (
                                                <button type="button" className="btn btn--ghost btn--sm" disabled={!!executando} onClick={() => executar(f._id, () => alterar(f._id, 'reabrir'))}>{t('contratante.faturas.reabrir')}</button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </Modal>
    )
}

export default FaturasModal
