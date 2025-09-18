import { createHash } from 'crypto'

import type { Algorithm } from './types'

const throwError = (message: string) => {
  throw new Error(`vite-subresource-integrity-plugin: ${message}`)
}

export const validateAlgorithms = (algorithms: Algorithm | Algorithm[]) => {
  if (!Array.isArray(algorithms) && typeof algorithms !== 'string') {
    throwError('algorithms must be an array or string of hash algorithm.')
  }
  algorithms = typeof algorithms === 'string' ? [algorithms] : algorithms
  for (let i = 0; i < algorithms.length; ++i) {
    try {
      createHash(algorithms[i])
    } catch (e: unknown) {
      throwError(`${algorithms[i]} method not supported.`)
    }
  }
}

export const validateExtensions = (extensions: string[]) => {
  if (!Array.isArray(extensions)) {
    throwError('extensions must be an array of string.')
  }
}
