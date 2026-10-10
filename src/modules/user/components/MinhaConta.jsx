import { useState } from 'react'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData } from '@/i18n/formatar'
import { nomeDoPais } from '@/i18n/paises'
import { useAssinatura } from '@/modules/assinatura/assinatura.hooks'
import MinhaAssinatura from '@/modules/assinatura/components/MinhaAssinatura'
import { useMinhaConta } from '../user.hooks'
import EditarMinhaContaModal from './EditarMinhaContaModal'
import AlterarSenhaModal from './AlterarSenhaModal'
import './minha-conta.css'

function iniciais(nome) {
    return String(nome ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

// Só o dono da conta (admin) paga e cancela a assinatura.
function AssinaturaDaConta() {
    const { assinatura, loading, irParaPortal, irParaCheckout, cancelarCartao, verificarPagamento } = useAssinatura()
    const onRefazer = assinatura?.cobranca === 'recorrente' && assinatura?.planoId?._id ? () => irParaCheckout(assinatura.planoId._id) : undefined
    return <MinhaAssinatura assinatura={assinatura} carregando={loading} onVerificar={verificarPagamento} onCancelar={cancelarCartao} onGerenciarStripe={irParaPortal} onRefazer={onRefazer} comLinkDosPlanos />
}

// Minha conta (modelo do SoftwareClinic): cartão do perfil com tudo à mostra; editar e trocar senha em modais.
export function MinhaConta() {
    const { user, atualizarUsuarioLogado } = useAuthContext()
    const { t, idioma } = useIdioma()
    const { perfil, loading, erro, sucesso, salvarPerfil, alterarSenha } = useMinhaConta(atualizarUsuarioLogado)
    const [modal, setModal] = useState(null)

    const ehAdmin = ['admin', 'super_admin'].includes(user?.role)
    const mostraAssinatura = user?.role === 'admin'

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('conta.minhaConta')}</h1>
                    <p className="page-subtitle">{mostraAssinatura ? t('conta.minhaContaSubAdmin') : t('conta.minhaContaSub')}</p>
                </div>
            </header>

            {erro && !modal && <p className="alert alert--error" role="alert">{erro.message}</p>}
            {sucesso && <p className="alert alert--success" role="status">{sucesso}</p>}

            <div className={`conta-grid${mostraAssinatura ? '' : ' conta-grid--single'}`}>
                {loading ? (
                    <section className="card conta-perfil" aria-busy="true">
                        <div className="conta-perfil__head">
                            <div className="skeleton conta-perfil__avatar-skeleton" />
                            <div className="conta-perfil__quem">
                                <div className="skeleton skeleton--line" style={{ width: '60%', height: 20 }} />
                                <div className="skeleton skeleton--line" style={{ width: '80%' }} />
                            </div>
                        </div>
                        <div className="skeleton skeleton--line" style={{ width: '100%', height: 70 }} />
                    </section>
                ) : perfil && (
                    <section className="card conta-perfil">
                        <div className="conta-perfil__head">
                            <div className="avatar avatar--lg" aria-hidden="true">{iniciais(perfil.nomeCompleto)}</div>
                            <div className="conta-perfil__quem">
                                <h2 className="conta-perfil__nome">{perfil.nomeCompleto}</h2>
                                <p className="conta-perfil__email">{perfil.email}</p>
                                <span className={`badge badge--${perfil.role}`}>{t(`comum.papel.${perfil.role}`)}</span>
                            </div>
                        </div>

                        <dl className="conta-detalhes">
                            <div>
                                <dt>{t('conta.telefone')}</dt>
                                <dd>{perfil.telefone || '—'}</dd>
                            </div>
                            <div>
                                <dt>{t('conta.membroDesde')}</dt>
                                <dd>{formatarData(perfil.createdAt, idioma)}</dd>
                            </div>
                            <div>
                                <dt>{t('conta.empresa')}</dt>
                                <dd>{perfil.nomeEmpresa || '—'}</dd>
                            </div>
                            <div>
                                <dt>{t('auth.pais')}</dt>
                                <dd>{nomeDoPais(perfil.pais ?? 'BR', idioma)}</dd>
                            </div>
                            <div>
                                <dt>{t('conta.idiomaCurto')}</dt>
                                <dd>{perfil.idioma === 'en' ? 'English' : 'Português'}</dd>
                            </div>
                        </dl>

                        <div className="conta-perfil__acoes">
                            <button type="button" className="btn btn--primary" onClick={() => setModal('dados')}>{t('conta.editarDados')}</button>
                            <button type="button" className="btn btn--ghost" onClick={() => setModal('senha')}>{t('conta.alterarSenha')}</button>
                        </div>
                    </section>
                )}

                {mostraAssinatura && <AssinaturaDaConta />}
            </div>

            {modal === 'dados' && perfil && <EditarMinhaContaModal perfil={perfil} ehAdmin={ehAdmin} erro={erro} onSave={salvarPerfil} onClose={() => setModal(null)} />}
            {modal === 'senha' && <AlterarSenhaModal erro={erro} onSave={alterarSenha} onClose={() => setModal(null)} />}
        </div>
    )
}

export default MinhaConta
