/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_URL?: string
  readonly VITE_CONFIG_CACHE_TIMEOUT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}