import { useState } from 'react'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useIdioma } from '@/i18n/useIdioma'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import EmptyState from '@/components/EmptyState/EmptyState'
import ExcluirInline from '@/components/ExcluirInline/ExcluirInline'
import { IconeCadeado, IconeLapis, IconeMais, IconeUsuarios } from '@/components/Icones/Icones'
import { useEquipe } from '../user.hooks'
import { atualizarMembro, criarMembro, redefinirSenhaMembro } from '../user.api'

function MembroModal({ membro, modo, onSalvo, onClose }) {
    const { t } = useIdioma()
    const [form, setForm] = useState({ nomeCompleto: membro?.nomeCompleto ?? '', email: membro?.email ?? '', role: membro?.role ?? 'membro', password: '' })
    const [erro, setErro] = useState(null)
    const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })

    async function salvar() {
        setErro(null)
        try {
            if (modo === 'senha') {
                await redefinirSenhaMembro(membro._id, form.password)
            } else {
                const { data } = membro ? await atualizarMembro(membro._id, form) : await criarMembro(form)
                onSalvo(data)
            }
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    const titulo = modo === 'senha' ? t('conta.redefinirSenha') : membro ? t('conta.editarMembro') : t('conta.novoMembro')
    return (
        <Modal title={titulo} onClose={onClose}>
            {(fechar) => (
                <ModalForm erro={erro} onSubmit={salvar} fechar={fechar}>
                    {modo !== 'senha' && (
                        <>
                            <div className="field"><label className="field__label" htmlFor="mb-nome">{t('conta.nome')}</label><input id="mb-nome" className="input" required data-autofocus {...campo('nomeCompleto')} /></div>
                            <div className="field"><label className="field__label" htmlFor="mb-email">{t('conta.email')}</label><input id="mb-email" className="input" type="email" required {...campo('email')} /></div>
                            {(!membro || String(membro._id) !== String(membro.tenantId)) && (
                                <div className="field">
                                    <label className="field__label" htmlFor="mb-papel">{t('conta.papel')}</label>
                                    <select id="mb-papel" className="input" {...campo('role')}>
                                        <option value="membro">{t('comum.papel.membro')}</option>
                                        <option value="admin">{t('comum.papel.admin')}</option>
                                    </select>
                                    <span className="field__hint">{t('conta.papelDica')}</span>
                                </div>
                            )}
                        </>
                    )}
                    {(modo === 'senha' || !membro) && (
                        <div className="field">
                            <label className="field__label" htmlFor="mb-senha">{modo === 'senha' ? t('conta.novaSenha') : t('conta.senhaInicial')}</label>
                            <input id="mb-senha" className="input" type="password" autoComplete="new-password" minLength={6} required data-autofocus={modo === 'senha' || undefined} {...campo('password')} />
                            <span className="field__hint">{t('auth.senhaDica')}</span>
                        </div>
                    )}
                </ModalForm>
            )}
        </Modal>
    )
}

export function Equipe() {
    const { user } = useAuthContext()
    const { t } = useIdioma()
    const { membros, loading, erro, substituir, remover } = useEquipe()
    const [modal, setModal] = useState(null)
    const [erroAcao, setErroAcao] = useState(null)
    const ehAdmin = user?.role === 'admin'

    async function excluir(id) {
        setErroAcao(null)
        try {
            await remover(id)
            return true
        } catch (e) {
            setErroAcao(e)
            return false
        }
    }

    return (
        <div className="page page--narrow">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('conta.equipe')}</h1>
                    <p className="page-subtitle">{t('conta.equipeSub')}</p>
                </div>
                {ehAdmin && (
                    <div className="page-header__acoes">
                        <button type="button" className="btn btn--primary" onClick={() => setModal({ modo: 'novo' })}><IconeMais />{t('conta.adicionarMembro')}</button>
                    </div>
                )}
            </header>

            {(erro || erroAcao) && <p className="alert alert--error" role="alert">{(erroAcao ?? erro).message}</p>}

            <section className="card bloco">
                {loading ? (
                    <div aria-busy="true"><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" /></div>
                ) : membros.length <= 1 && !ehAdmin ? (
                    <EmptyState icone={<IconeUsuarios />} titulo={t('conta.nenhumMembro')} />
                ) : (
                    <ul className="linhas">
                        {membros.map((m) => {
                            const dono = String(m._id) === String(m.tenantId)
                            const eu = String(m._id) === String(user?._id)
                            return (
                                <li key={m._id}>
                                    <span style={{ display: 'grid', minWidth: 0 }}>
                                        <strong>{m.nomeCompleto} {eu && <span className="texto-pequeno">({t('conta.voce')})</span>}</strong>
                                        <span className="texto-pequeno" style={{ overflowWrap: 'anywhere' }}>{m.email}</span>
                                    </span>
                                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                        <span className={`badge badge--${m.role === 'admin' ? 'primary' : 'neutro'}`}>{dono ? t('conta.dono') : t(`comum.papel.${m.role}`)}</span>
                                        {ehAdmin && (
                                            <>
                                                <button type="button" className="icon-btn" aria-label={t('comum.editar')} title={t('comum.editar')} onClick={() => setModal({ modo: 'editar', membro: m })}><IconeLapis /></button>
                                                <button type="button" className="icon-btn" aria-label={t('conta.redefinirSenha')} title={t('conta.redefinirSenha')} onClick={() => setModal({ modo: 'senha', membro: m })}><IconeCadeado /></button>
                                                {!dono && !eu && <ExcluirInline onConfirmar={() => excluir(m._id)} />}
                                            </>
                                        )}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>

            {modal && <MembroModal membro={modal.membro} modo={modal.modo} onSalvo={substituir} onClose={() => setModal(null)} />}
        </div>
    )
}

export default Equipe
