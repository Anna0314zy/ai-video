/// <reference types="vite/client" />

declare global {
  interface Window {
    SockJS: new (url: string) => WebSocket
  }
}

export {}
