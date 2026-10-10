export function Icone({ children, className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {children}
        </svg>
    )
}

export const IconeCadeadoAberto = () => <Icone><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></Icone>
export const IconeTrocar = () => <Icone><path d="m17 2 4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></Icone>
export const IconeRelogioMais = () => <Icone><circle cx="11" cy="13" r="8" /><path d="M11 9v4l2.5 2.5" /><path d="M18 2v4M16 4h4" /></Icone>
export const IconeChave = () => <Icone><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" /></Icone>
export const IconeTelefone = () => <Icone><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></Icone>
export const IconeGrafico = () => <Icone><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></Icone>
export const IconeContainer = () => <Icone><path d="M21 8 12 3 3 8v8l9 5 9-5Z" /><path d="m3 8 9 5 9-5M12 13v8" /></Icone>
export const IconeNuvem = () => <Icone><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></Icone>
export const IconeBusca = () => <Icone><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icone>
export const IconeMais = () => <Icone><path d="M5 12h14M12 5v14" /></Icone>
export const IconeLapis = () => <Icone><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></Icone>
export const IconeLixeira = () => <Icone><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icone>
export const IconeCheck = () => <Icone><path d="M20 6 9 17l-5-5" /></Icone>
export const IconeX = () => <Icone><path d="M18 6 6 18M6 6l12 12" /></Icone>
export const IconeAtualizar = () => <Icone><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8M21 3v5h-5" /></Icone>
export const IconeSetaEsquerda = () => <Icone><path d="m12 19-7-7 7-7M19 12H5" /></Icone>
export const IconeSetaDireita = () => <Icone><path d="m9 18 6-6-6-6" /></Icone>
export const IconeCopiar = () => <Icone><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></Icone>
export const IconeServidor = () => <Icone><rect width="20" height="8" x="2" y="2" rx="2" /><rect width="20" height="8" x="2" y="14" rx="2" /><path d="M6 6h.01M6 18h.01" /></Icone>
export const IconeGlobo = () => <Icone><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Icone>
export const IconeSino = () => <Icone><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" /></Icone>
export const IconeCartao = () => <Icone><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /></Icone>
export const IconeUsuarios = () => <Icone><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icone>
export const IconeUsuario = () => <Icone><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icone>
export const IconePainel = () => <Icone><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></Icone>
export const IconeEmpresa = () => <Icone><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" /></Icone>
export const IconeEtiqueta = () => <Icone><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><circle cx="7.5" cy="7.5" r=".5" /></Icone>
export const IconeSair = () => <Icone><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></Icone>
export const IconeCadeado = () => <Icone><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icone>
export const IconeEscudo = () => <Icone><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></Icone>
export const IconeCaixa = () => <Icone><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></Icone>
export const IconeHistorico = () => <Icone><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5M12 7v5l4 2" /></Icone>
export const IconeTerminal = () => <Icone><path d="m4 17 6-6-6-6M12 19h8" /></Icone>
export const IconeAtividade = () => <Icone><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></Icone>
export const IconeMemoria = () => <Icone><path d="M6 19v-3M10 19v-3M14 19v-3M18 19v-3M8 11V9M16 11V9M12 11V9M2 15h20M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.1a2 2 0 0 0 0 3.837V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.1a2 2 0 0 0 0-3.837Z" /></Icone>
export const IconeEmail = () => <Icone><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Icone>
export const IconeAlerta = () => <Icone><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01" /></Icone>
export const IconeTelegram = () => <Icone><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></Icone>
export const IconeRelogio = () => <Icone><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Icone>
export const IconeAbrir = () => <Icone><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></Icone>
export const IconePix = () => <Icone><path d="m12 2 4.24 4.24a3 3 0 0 1 0 4.24L12 14.7l-4.24-4.22a3 3 0 0 1 0-4.24ZM12 9.3l4.24 4.24a3 3 0 0 1 0 4.24L12 22l-4.24-4.22a3 3 0 0 1 0-4.24Z" /></Icone>
