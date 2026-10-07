import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData } from '@/i18n/formatar'
import { IconeAbrir, IconeSino, IconeTelegram } from '@/components/Icones/Icones'
import { useAlertas } from '../alerta.hooks'
import './alertas.css'

const TIPOS = ['queda', 'lentidao', 'agente', 'recursos', 'ssl', 'dominio', 'emails', 'seguranca']
const LIMITES = [
    { chave: 'ram', rotulo: 'alerta.limiteRam', min: 50, max: 99 },
    { chave: 'disco', rotulo: 'alerta.limiteDisco', min: 50, max: 99 },
    { chave: 'diasSsl', rotulo: 'alerta.diasSsl', min: 1, max: 60 },
    { chave: 'diasDominio', rotulo: 'alerta.diasDominio', min: 1, max: 120 },
]

function CardTelegram({ config, link, gerarLink, desconectar, testar }) {
    const { t, idioma } = useIdioma()
    const [acao, setAcao] = useState(null)
    const [msg, setMsg] = useState(null)
    const conectado = !!config.telegram?.chatId

    async function executar(nome, fn) {
        setMsg(null)
        setAcao(nome)
        try {
            const r = await fn()
            if (r?.message) setMsg({ tipo: 'success', texto: r.message })
        } catch (e) {
            setMsg({ tipo: 'error', texto: e.message })
        } finally {
            setAcao(null)
        }
    }

    return (
        <section className="card bloco telegram" style={{ '--i': 0 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeTelegram />{t('alerta.telegram')}</h2>
                <span className={`badge badge--${conectado ? 'success' : 'neutro'}${conectado ? ' badge--live' : ''}`}>
                    {conectado ? t('alerta.conectado', { nome: config.telegram.nome ?? 'Telegram' }) : t('alerta.desconectado')}
                </span>
            </div>

            {msg && <p className={`alert alert--${msg.tipo}`} role={msg.tipo === 'error' ? 'alert' : 'status'}>{msg.texto}</p>}

            {!config.telegramDisponivel ? (
                <p className="alert alert--info">{t('alerta.indisponivel')}</p>
            ) : conectado ? (
                <>
                    <p className="texto-pequeno">{t('alerta.conectadoEm', { data: formatarData(config.telegram.conectadoEm, idioma) })}</p>
                    <div className="telegram__acoes">
                        <button type="button" className={`btn btn--primary${acao === 'testar' ? ' btn--loading' : ''}`} disabled={!!acao} onClick={() => executar('testar', testar)}>
                            {acao === 'testar' ? t('alerta.testando') : t('alerta.testar')}
                        </button>
                        <button type="button" className="btn btn--ghost" disabled={!!acao} onClick={() => executar('desconectar', desconectar)}>{t('alerta.desconectar')}</button>
                    </div>
                </>
            ) : link ? (
                <div className="telegram__vincular">
                    <ol className="telegram__passos">
                        <li>{t('alerta.passo1')}</li>
                        <li>{t('alerta.passo2')}</li>
                        <li>{t('alerta.passo3')}</li>
                    </ol>
                    <a className="btn btn--primary" href={link.link} target="_blank" rel="noreferrer"><IconeAbrir />{t('alerta.abrirTelegram')}</a>
                    <p className="telegram__aguardando" role="status"><span className="telegram__pulso" aria-hidden="true" />{t('alerta.aguardando')}</p>
                    <p className="texto-pequeno">{t('alerta.expira')} {t('alerta.grupoDica')}</p>
                </div>
            ) : (
                <button type="button" className={`btn btn--primary${acao === 'link' ? ' btn--loading' : ''}`} disabled={!!acao} onClick={() => executar('link', gerarLink)}>
                    <IconeTelegram />{acao === 'link' ? t('alerta.gerando') : t('alerta.conectar')}
                </button>
            )}
        </section>
    )
}

function CardPreferencias({ config, salvar }) {
    const { t } = useIdioma()
    const [ativos, setAtivos] = useState(config.ativos)
    const [limites, setLimites] = useState(config.limites)
    const [salvando, setSalvando] = useState(false)
    const [msg, setMsg] = useState(null)

    async function enviar(e) {
        e.preventDefault()
        setMsg(null)
        setSalvando(true)
        try {
            const r = await salvar({ ativos, limites })
            setMsg({ tipo: 'success', texto: r.message })
        } catch (err) {
            setMsg({ tipo: 'error', texto: err.message })
        } finally {
            setSalvando(false)
        }
    }

    return (
        <form className="card bloco" style={{ '--i': 1 }} onSubmit={enviar}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeSino />{t('alerta.oQueAvisar')}</h2>
            </div>
            <ul className="linhas alertas-tipos">
                {TIPOS.map((tipo) => {
                    const [titulo, descricao] = t(`alerta.tipos.${tipo}`)
                    return (
                        <li key={tipo}>
                            <span className="alertas-tipos__texto">
                                <strong>{titulo}</strong>
                                <span className="texto-pequeno">{descricao}</span>
                            </span>
                            <button type="button" className="switch" role="switch" aria-checked={!!ativos[tipo]} aria-label={titulo} onClick={() => setAtivos({ ...ativos, [tipo]: !ativos[tipo] })}>
                                <span className="switch__track" />
                            </button>
                        </li>
                    )
                })}
            </ul>

            <h3 className="bloco__subtitulo">{t('alerta.limites')}</h3>
            <div className="form-grid">
                {LIMITES.map((l) => (
                    <div className="field" key={l.chave}>
                        <label className="field__label" htmlFor={`lim-${l.chave}`}>{t(l.rotulo)}</label>
                        <input id={`lim-${l.chave}`} className="input" type="number" min={l.min} max={l.max} value={limites[l.chave]} onChange={(e) => setLimites({ ...limites, [l.chave]: e.target.value })} />
                    </div>
                ))}
            </div>

            {msg && <p className={`alert alert--${msg.tipo}`} role={msg.tipo === 'error' ? 'alert' : 'status'}>{msg.texto}</p>}
            <div className="form-actions">
                <button type="submit" className={`btn btn--primary${salvando ? ' btn--loading' : ''}`} disabled={salvando}>
                    {salvando ? t('comum.salvando') : t('alerta.salvar')}
                </button>
            </div>
        </form>
    )
}

export function Alertas() {
    const { t } = useIdioma()
    const { config, loading, erro, link, gerarLink, salvar, desconectar, testar } = useAlertas()

    return (
        <div className="page page--narrow alertas">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('alerta.titulo')}</h1>
                    <p className="page-subtitle">{t('alerta.subtitulo')}</p>
                </div>
            </header>
            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
            {loading ? (
                <div className="card bloco" aria-busy="true"><div className="skeleton skeleton--line" style={{ width: '40%' }} /><div className="skeleton skeleton--line" style={{ height: 44 }} /></div>
            ) : config && (
                <>
                    <CardTelegram config={config} link={link} gerarLink={gerarLink} desconectar={desconectar} testar={testar} />
                    <CardPreferencias config={config} salvar={salvar} />
                </>
            )}
        </div>
    )
}

export default Alertas
