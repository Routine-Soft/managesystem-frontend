# ServerFall — Frontend (website + dashboard)

Website and dashboard for **ServerFall**, a multi-tenant SaaS that lets developers monitor their clients' servers and websites (uptime, SSL, domains, resources, containers, traffic by country) and gives each end client a portal to follow their system and pay the monthly fee.

> The project was formerly called **ManageSystem**. The repository keeps the `managesystem` name.

![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/vite-build-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-vercel-000000?logo=vercel)
![License](https://img.shields.io/badge/license-private-lightgrey)

## Demo

- **Website and dashboard:** https://serverfall.vercel.app
- **API:** https://api-monitor.cestsegtrabalho.com.br/api (backend in [`managesystem-backend`](../managesystem-backend))

## Features

- **Public landing page** with plans.
- **Sign-up, login and "My account"**, with team members.
- **Overview** of all servers and a detailed dashboard per server: status, RAM/CPU/disk, containers, downtime, updates, logs and dependencies.
- **Traffic map** by country (world map in SVG, loaded on demand).
- **Websites and domains:** SSL, domain expiration and email provider.
- **Alerts:** Telegram alert preferences.
- **End clients:** clients, invoices and payment settings (Mercado Pago or Stripe).
- **Client portal** (`#/portal`): the end client sees their system and invoices, without developer-only data or actions.
- **Subscription:** plans and checkout.
- **Super admin panel:** customers and revenue.
- **Two languages:** Portuguese and English.
- **Themes:** light, dark and "follow the system".
- **Installable as an app (PWA)**: one manifest for the dashboard and one for the portal.

## Tech stack

| Area | Technology |
|---|---|
| UI | React 19 |
| Build | Vite |
| Routing | React Router (`HashRouter`) |
| Styles | Plain CSS with design tokens |
| Charts and maps | Custom SVG charts, d3-geo, topojson-client, world-atlas |
| HTTP | Native `fetch` through `httpClient` (dashboard) and `portalClient` (portal) |
| Quality | ESLint |
| Hosting | Vercel |

## Prerequisites

- **Node.js 26.13.1** (see `.nvmrc`; with nvm, run `nvm use`)
- **npm**
- The backend running locally, or the URL of a test API

## Installation

```bash
git clone <repository-url> managesystem-frontend
cd managesystem-frontend
nvm use
npm install
cp .env.example .env.local   # set VITE_API_URL
npm run dev
```

The app opens at `http://localhost:5173`.

## Configuration (environment variables)

Only public values go here: everything starting with `VITE_` ends up in the browser bundle.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | API base URL, including `/api` |

```env
VITE_API_URL=http://localhost:8081/api
```

## Usage

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Builds the production bundle in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |

Quick check before pushing:

```bash
npx eslint src
npx vite build
```

## Folder structure

```
managesystem-frontend/
├── public/               # Icons and PWA manifests (dashboard and portal)
└── src/
    ├── App.jsx           # Routes (HashRouter)
    ├── components/       # Shared components (Sidebar, Modal, charts, CampoSenha, ThemeToggle...)
    ├── context/          # Auth and theme
    ├── hooks/            # useAuth, useTheme
    ├── i18n/             # Texts in Portuguese and English side by side
    ├── layouts/          # Main layout with the sidebar
    ├── modules/
    │   └── <entity>/     # landing, user, assinatura, admin, servidor, site, contratante, portal, alerta
    │       ├── <entity>.api.js
    │       ├── <entity>.hooks.js
    │       └── components/
    ├── services/         # httpClient and portalClient
    ├── styles/           # theme.css, ui.css, app.css
    └── utils/
```

## Deployment

- Hosted on **Vercel**. Every push to `main` publishes automatically.
- Set `VITE_API_URL` in the Vercel project settings.
- When a change touches both projects, deploy the **backend first**, then push the frontend.

## Contributing

1. Create a branch from `main`: `feature/<name>` (or `fix/<name>`).
2. Every new text needs both languages in `src/i18n/textos/` (used with `t('module.key')`).
3. Server dashboard cards are reused in the portal: keep developer-only data and actions hidden there.
4. Every color comes from a token; every screen must work on mobile without horizontal scroll.
5. Run `npx eslint src` and `npx vite build` before opening a pull request.
6. Write commit messages in Portuguese and open a pull request to `main`.

## License and author

**Private and proprietary.** All rights reserved. Copying, distribution or use without authorization is not allowed.

Developed by **Stanley Andrade**.
