type ConnectivityCallback = (online: boolean) => void
const listeners: ConnectivityCallback[] = []

export function onConnectivityChange(cb: ConnectivityCallback): void {
  listeners.push(cb)
}

function notify(online: boolean): void {
  listeners.forEach(cb => cb(online))
}

window.addEventListener('online', () => notify(true))
window.addEventListener('offline', () => notify(false))

export function isOnline(): boolean {
  return navigator.onLine
}