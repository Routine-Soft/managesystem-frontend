// Instalação do sistema como aplicativo (ícone na área de trabalho / tela inicial).
// O Chrome e o Edge avisam pelo evento "beforeinstallprompt" que dá para instalar; ele pode chegar antes do
// React montar, por isso é guardado aqui e lido pelos componentes com useSyncExternalStore.
let pedidoDeInstalacao = null
const ouvintes = new Set()

function avisar() {
  ouvintes.forEach((ouvinte) => ouvinte())
}

export function registrarApp() {
  if (typeof window === 'undefined') return
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault()
    pedidoDeInstalacao = evento
    avisar()
  })
  window.addEventListener('appinstalled', () => {
    pedidoDeInstalacao = null
    avisar()
  })
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }
}

export function assinarInstalacao(ouvinte) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

export function podeInstalar() {
  return !!pedidoDeInstalacao
}

// Abre a janela do navegador "Instalar ServerFall?". O pedido só pode ser usado uma vez.
export async function instalarApp() {
  if (!pedidoDeInstalacao) return false
  const pedido = pedidoDeInstalacao
  pedidoDeInstalacao = null
  avisar()
  await pedido.prompt()
  const { outcome } = await pedido.userChoice
  return outcome === 'accepted'
}

// Já aberto pelo ícone instalado: não oferece instalar de novo.
export function rodandoComoApp() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// iPhone e iPad não têm a janela de instalar: lá é Compartilhar → "Adicionar à Tela de Início".
// (iPad novo se apresenta como Mac, por isso o teste do toque.)
export function ehIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

// Manifesto da área em uso: o app instalado pelo portal do cliente abre no portal, não no painel.
export function usarManifesto(caminho) {
  const link = document.querySelector('link[rel="manifest"]')
  if (link && link.getAttribute('href') !== caminho) link.setAttribute('href', caminho)
}

export function ehAndroid() {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
}
