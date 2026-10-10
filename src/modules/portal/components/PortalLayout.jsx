import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle'
import IdiomaToggle from '@/components/IdiomaToggle/IdiomaToggle'
import Marca from '@/components/Sidebar/Marca'
import { IconeSair } from '@/components/Icones/Icones'
import { sessaoDoPortal } from '@/services/portalClient'
import { usarManifesto } from '@/utils/instalarApp'
import { sair, salvarIdioma } from '../portal.api'
import { useInstalarPortal } from '../portal.hooks'
import { AvisoInstalarPortal, BotaoInstalarPortal, ComoInstalar } from './InstalarPortal'
import './portal.css'

// Portal do cliente final: barra no topo (sem menu lateral) e uma página só.
export function PortalLayout({ empresa, children }) {
    const { t } = useIdioma()
    const navigate = useNavigate()
    const app = useInstalarPortal()

    // Instalado daqui, o app abre no portal. Ao sair do portal volta o manifesto do painel.
    useEffect(() => {
        usarManifesto('/manifest-portal.webmanifest')
        return () => usarManifesto('/manifest.webmanifest')
    }, [])

    async function encerrar() {
        await sair().catch(() => null)
        sessaoDoPortal.encerrar()
        navigate('/portal/login', { replace: true })
    }

    return (
        <div className="portal">
            <div className="portal__fundo" aria-hidden="true" />
            <header className="portal__topo">
                <Marca empresa={empresa} />
                <div className="portal__topo-acoes">
                    {app.modo && <BotaoInstalarPortal onInstalar={app.instalar} />}
                    <IdiomaToggle onTrocar={(idioma) => salvarIdioma(idioma).catch(() => null)} />
                    <ThemeToggle />
                    <button type="button" className="icon-btn" aria-label={t('comum.sair')} title={t('comum.sair')} onClick={encerrar}><IconeSair /></button>
                </div>
            </header>
            <main className="portal__conteudo">
                {app.modo && !app.dispensado && <AvisoInstalarPortal onInstalar={app.instalar} onDispensar={app.dispensar} />}
                {children}
            </main>
            {app.passoAPasso && <ComoInstalar plataforma={app.passoAPasso} onClose={app.fecharPassoAPasso} />}
        </div>
    )
}

export default PortalLayout
