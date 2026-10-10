import { Fragment } from 'react'

// Deixa o navegador quebrar o e-mail depois do "@" e dos pontos, em vez de no meio de uma palavra.
export function EmailQuebravel({ email }) {
    if (!email) return null
    const partes = email.split(/(?<=[@.])/)
    return partes.map((parte, i) => (
        <Fragment key={i}>
            {parte}
            {i < partes.length - 1 && <wbr />}
        </Fragment>
    ))
}

export default EmailQuebravel
