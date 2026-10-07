import './EmptyState.css'

// Estado vazio: ícone, frase curta e o botão da ação.
export function EmptyState({ icone, titulo, texto, children }) {
    return (
        <div className="vazio">
            {icone && <span className="vazio__icone">{icone}</span>}
            <strong className="vazio__titulo">{titulo}</strong>
            {texto && <p className="vazio__texto">{texto}</p>}
            {children && <div className="vazio__acoes">{children}</div>}
        </div>
    )
}

export default EmptyState
