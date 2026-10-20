# ServerFall (antigo ManageSystem): frontend

Site e painel do ServerFall, em **https://serverfall.vercel.app** (push na `main` publica sozinho na Vercel). API: `VITE_API_URL` (produção: `https://api-monitor.cestsegtrabalho.com.br/api`). Contexto completo do sistema, regras e pendências: `../managesystem-backend/CLAUDE.md`.

- Módulos em `src/modules/`: `landing` (página inicial pública), `user`, `assinatura`, `admin` (super admin), `servidor` (Visão geral e painel do servidor; cartões em `components/painel/`), `site`, `contratante` (clientes finais, faturas, recebimentos), `portal` (portal do cliente final, sessão própria em `services/portalClient.js`), `alerta`.
- Textos em `src/i18n/textos/*.js` (pt e en lado a lado); `t('modulo.chave')`. Texto novo → as duas línguas.
- Os cartões do painel do servidor são reaproveitados no portal (`portal/components/PortalTecnico.jsx`); o portal esconde ações e dados só do programador (`CardSistema mostrarAcoes={false}`).
- Mapa de acessos: `components/graficos/MapaMundi.jsx` (world-atlas carregado sob demanda) + `mapa.paises.js`.
- Instalável como app: `public/manifest.webmanifest` (painel) e `public/manifest-portal.webmanifest` (portal, abre em `#/portal`).
- Verificar: `npx eslint src` e `npx vite build`.
