export type Algorithm = 'sha256' | 'sha384' | 'sha512'

type FileName = string

type Path = string

export interface PluginOptions {
  enabled?: boolean
  algorithm?: Algorithm[] | Algorithm
  manifest?: boolean | string
  extensions?: string[]
}

type Without<T extends Record<string, any>, E extends Record<string, any>> = {
  [P in Exclude<keyof T, keyof E>]?: never
}

type XOR<T extends Record<string, any>, E extends Record<string, any>> =
  | (Without<T, E> & E)
  | (Without<E, T> & T)

export type NormalizeBundle = {
  fileName: string
  facadeModuleId: string
  name: string
  isEntry: boolean
} & XOR<
  {
    source: string
    type: 'asset'
  },
  {
    code: string
    type: 'chunk'
  }
>

export type VitePluginSriMaps = Record<
  FileName,
  {
    integrity: string
    path: Path
  }
>
