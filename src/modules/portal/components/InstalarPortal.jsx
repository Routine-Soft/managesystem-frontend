import { useIdioma } from '@/i18n/useIdioma'
import Modal from '@/components/Modal/Modal'
import { Icone, IconeX } from '@/components/Icones/Icones'

const IconeBaixar = () => <Icone><path d="M12 3v12M7 10l5 5 5-5" /><rect x="3" y="17" width="18" height="4" rx="1" /></Icone>
const IconeCompartilharIos = () => <Icone><path d="M12 15V3M8 7l4-4 4 4" /><path d="M7 10H5v11h14V10h-2" /></Icone>

// Botão compacto na barra de cima (no celular, só o ícone). Fica mesmo depois de fechar o aviso.
export function BotaoInstalarPortal({ onInstalar }) {
    const { t } = useIdioma()
    return (
        <button type="button" className="portal-instalar-btn" aria-label={t('portal.instalar.botao')} title={t('portal.instalar.botao')} onClick={onInstalar}>
            <IconeBaixar />
            <span>{t('portal.instalar.botaoCurto')}</span>
        </button>
    )
}

// Aviso no topo da página, com o ícone do app. O cliente pode fechar.
export function AvisoInstalarPortal({ onInstalar, onDispensar }) {
    const { t } = useIdioma()
    return (
        <aside className="card portal-instalar" aria-label={t('portal.instalar.botao')}>
            <img className="portal-instalar__icone" src="/icons/icon-192.png" alt="" width="44" height="44" />
            <div className="portal-instalar__texto">
                <strong>{t('portal.instalar.titulo')}</strong>
                <span>{t('portal.instalar.texto')}</span>
            </div>
            <button type="button" className="btn btn--primary btn--sm" onClick={onInstalar}><IconeBaixar />{t('portal.instalar.botaoCurto')}</button>
            <button type="button" className="icon-btn portal-instalar__fechar" aria-label={t('portal.instalar.agoraNao')} title={t('portal.instalar.agoraNao')} onClick={onDispensar}><IconeX /></button>
        </aside>
    )
}

const PASSOS = { ios: 3, android: 2, computador: 2 }

// Passo a passo de cada aparelho, para quando o navegador não abre a janela de instalar.
export function ComoInstalar({ plataforma, onClose }) {
    const { t } = useIdioma()
    const passos = Array.from({ length: PASSOS[plataforma] }, (_, i) => i + 1)
    return (
        <Modal title={t(`portal.instalar.${plataforma}.titulo`)} onClose={onClose}>
            <ol className="instalar-ios">
                {passos.map((n) => (
                    <li key={n}>
                        <span className="instalar-ios__num">{n}</span>
                        <span>
                            {t(`portal.instalar.${plataforma}.passo${n}`)}
                            {plataforma === 'ios' && n === 1 && <> <span className="instalar-ios__icone"><IconeCompartilharIos /></span></>}
                        </span>
                    </li>
                ))}
            </ol>
            <button type="button" className="btn btn--primary btn--block" data-autofocus onClick={onClose}>{t('portal.instalar.entendi')}</button>
        </Modal>
    )
}
