import { expect, test } from 'vitest'

import type { NormalizeBundle } from '@/types'
import {
  computeIntegrity,
  findAssetByFileName,
  getFileName,
  transToSriHashes
} from '@/util'

test('should calculate the correct integrity value', () => {
  expect(computeIntegrity(['sha384'], "alert('Hello, world.');")).toBe(
    'sha384-H8BRh8j48O9oYatfu5AZzq6A9RINhZO5H16dQZngK7T62em8MUt1FLm52t+eX6xO'
  )
  expect(computeIntegrity(['sha256'], "alert('Hello, world.');")).toBe(
    'sha256-qznLcsROx4GACP2dm0UCKCzCG+HiZ1guq6ZZDob/Tng='
  )
  expect(
    computeIntegrity(['sha256', 'sha384'], "alert('Hello, world.');")
  ).toBe(
    'sha256-qznLcsROx4GACP2dm0UCKCzCG+HiZ1guq6ZZDob/Tng= sha384-H8BRh8j48O9oYatfu5AZzq6A9RINhZO5H16dQZngK7T62em8MUt1FLm52t+eX6xO'
  )
})

test('should return the correct file name', () => {
  expect(getFileName('src/test/unit.test.ts')).toBe('unit.test.ts')
  expect(getFileName('unit.test.ts')).toBe('unit.test.ts')
  expect(getFileName(undefined)).toBe('')
})

test('should return the correct asset', () => {
  const bundle: Record<string, NormalizeBundle> = {
    'src/test/unit.test.js': {
      fileName: 'src/test/unit.test.ts',
      facadeModuleId: 'src/test/unit.test.ts',
      name: 'src/test/unit.test.ts',
      isEntry: true,
      code: 'body { color: red }',
      type: 'chunk'
    },
    'src/test/unit.test.css': {
      fileName: 'src/test/unit.test.ts.js',
      facadeModuleId: 'src/test/unit.test.ts',
      name: 'src/test/unit.test.ts',
      isEntry: false,
      source: "alert('Hello, world.');",
      type: 'asset'
    }
  }
  expect(findAssetByFileName(bundle, 'unit.test.css')).toEqual(
    bundle['src/test/unit.test.css']
  )
  expect(findAssetByFileName(bundle, 'index.js')).toBeUndefined()
})

test('should return the correct sri hashes', () => {
  expect(
    transToSriHashes({
      'index.js': {
        integrity:
          'sha384-H8BRh8j48O9oYatfu5AZzq6A9RINhZO5H16dQZngK7T62em8MUt1FLm52t+eX6xO',
        path: 'assets/index.js'
      }
    })
  ).toMatchObject({
    'assets/index.js':
      'sha384-H8BRh8j48O9oYatfu5AZzq6A9RINhZO5H16dQZngK7T62em8MUt1FLm52t+eX6xO'
  })
  expect(
    transToSriHashes(
      {
        'index.js': {
          integrity:
            'sha384-H8BRh8j48O9oYatfu5AZzq6A9RINhZO5H16dQZngK7T62em8MUt1FLm52t+eX6xO',
          path: 'assets/index.js'
        }
      },
      'fileName'
    )
  ).toMatchObject({
    'index.js':
      'sha384-H8BRh8j48O9oYatfu5AZzq6A9RINhZO5H16dQZngK7T62em8MUt1FLm52t+eX6xO'
  })
})
