# ManageSystem — frontend

Painel web (React 19 + Vite, CSS puro, HashRouter), bilíngue (pt/en), tema claro/escuro/sistema.

Módulos em `src/modules/<entidade>/` (`.api.js`, `.hooks.js`, `.utils.js`, `components/`).
Textos das telas em `src/i18n/textos/<area>.js` (pt e en lado a lado).
Gráficos em SVG próprio em `src/components/graficos/`.

```bash
npm install
VITE_API_URL=http://localhost:8080/api npm run dev
npx eslint src && npx vite build
```

Publicação: Vercel (push na `main`), com a variável `VITE_API_URL` apontando para a API.
# managesystem-frontend
