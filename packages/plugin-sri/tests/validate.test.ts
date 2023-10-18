/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
import { expect, test } from 'vitest'

import { validateAlgorithms, validateExtensions } from '@/validate'

test('should throw error when algorithms is not an array or string', () => {
  ;[123, true, undefined, null, () => 1].forEach((algorithm) => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      validateAlgorithms(algorithm)
    }).toThrow('algorithms must be an array or string of hash algorithm.')
  })
})

test('should throw error when algorithms is not supported', () => {
  expect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    validateAlgorithms(['sha1111'])
    console.log('pass')
  }).toThrow('sha1111 method not supported.')
})

test('should throw error when extensions is not an array', () => {
  ;[123, true, undefined, null, () => 1].forEach((extensions) => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      validateExtensions(extensions)
    }).toThrow('extensions must be an array of string.')
  })
})
