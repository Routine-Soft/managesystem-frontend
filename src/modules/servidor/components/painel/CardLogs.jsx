import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarDataHora } from '@/i18n/formatar'
import { IconeTerminal } from '@/components/Icones/Icones'

const VISIVEIS = 6

export function CardLogs({ servidor: s }) {
    const { t, idioma } = useIdioma()
    const [todos, setTodos] = useState(false)
    const logs = s.logs ?? []
    const visiveis = todos ? logs : logs.slice(0, VISIVEIS)

    return (
        <section className="card bloco" style={{ '--i': 8 }}>
            <div className="bloco__cabecalho">
                <h2 className="bloco__titulo"><IconeTerminal />{t('servidor.logs.titulo')}</h2>
                {logs.length > 0 && <span className="badge badge--danger">{logs.length}</span>}
            </div>
            <p className="texto-pequeno">{t('servidor.logs.dica')}</p>
            {logs.length === 0 ? (
                <p className="texto-suave logs__vazio">{t('servidor.logs.vazio')}</p>
            ) : (
                <>
                    <ul className="logs">
                        {visiveis.map((l, i) => (
                            <li key={`${l.em}-${i}`}>
                                <span className="logs__meta">{formatarDataHora(l.em, idioma)} · {l.origem}</span>
                                <code>{l.linha}</code>
                            </li>
                        ))}
                    </ul>
                    {logs.length > VISIVEIS && (
                        <button type="button" className="btn btn--ghost btn--block" onClick={() => setTodos(!todos)}>
                            {todos ? t('comum.verMenos') : t('comum.verTodos')}
                        </button>
                    )}
                </>
            )}
        </section>
    )
}

export default CardLogs
