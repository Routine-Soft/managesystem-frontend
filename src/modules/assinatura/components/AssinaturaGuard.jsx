import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeCadeado } from '@/components/Icones/Icones'
import { buscarAssinatura } from '../assinatura.api'
import './assinatura.css'

// Telas que continuam abertas com o acesso bloqueado, para o cliente conseguir regularizar.
const ROTAS_LIVRES = ['/assinatura', '/minha-conta']

function AcessoBloqueado({ motivo, podePagar }) {
    const { t } = useIdioma()
    return (
        <div className="page page--narrow">
            <section className="card assinatura-retorno" data-situacao="bloqueado" role="alert">
                <div className="assinatura-retorno__icone"><IconeCadeado /></div>
                <h2 className="assinatura-retorno__titulo">{t('assinatura.bloqueadoTitulo')}</h2>
                <p className="assinatura-retorno__texto">{motivo}</p>
                {!podePagar && <p className="assinatura-retorno__texto">{t('assinatura.bloqueadoDono')}</p>}
                <div className="assinatura-retorno__acoes">
                    {podePagar && <Link to="/assinatura" className="btn btn--primary">{t('assinatura.regularizar')}</Link>}
                    <Link to="/minha-conta" className="btn btn--ghost">{t('comum.menu.minhaConta')}</Link>
                </div>
            </section>
        </div>
    )
}

// Mostra "acesso bloqueado" no lugar das telas quando a assinatura não dá mais acesso.
// Quem barra de verdade é o backend (402); aqui só se evita mostrar telas quebradas.
export function AssinaturaGuard({ children }) {
    const { user } = useAuthContext()
    const { pathname } = useLocation()
    const [motivo, setMotivo] = useState(null)
    const bloqueado = useRef(false)
    const jaVerificou = useRef(false)
    const ehSuperAdmin = user?.role === 'super_admin'

    useEffect(() => {
        if (ehSuperAdmin || (jaVerificou.current && !bloqueado.current)) return undefined
        let ignore = false
        buscarAssinatura()
            .then(({ data }) => {
                if (ignore) return
                jaVerificou.current = true
                const m = data.acesso?.liberado === false ? data.acesso.motivo : null
                bloqueado.current = !!m
                setMotivo(m)
            })
            .catch(() => {
                jaVerificou.current = true
            })
        return () => {
            ignore = true
        }
    }, [pathname, ehSuperAdmin])

    useEffect(() => {
        function aoBloquear(e) {
            bloqueado.current = true
            setMotivo(e.detail?.motivo ?? '')
        }
        function aoAtualizar(e) {
            if (e.detail?.acesso?.liberado) {
                bloqueado.current = false
                setMotivo(null)
            }
        }
        window.addEventListener('assinatura:inativa', aoBloquear)
        window.addEventListener('assinatura:atualizada', aoAtualizar)
        return () => {
            window.removeEventListener('assinatura:inativa', aoBloquear)
            window.removeEventListener('assinatura:atualizada', aoAtualizar)
        }
    }, [])

    const rotaLivre = ROTAS_LIVRES.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`))
    if (motivo !== null && !ehSuperAdmin && !rotaLivre) {
        return <AcessoBloqueado motivo={motivo} podePagar={user?.role === 'admin'} />
    }
    return children
}

export default AssinaturaGuard
