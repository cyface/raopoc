import '@testing-library/jest-dom'
import { beforeAll, afterAll } from 'vitest'

// Suppress jsdom navigation errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Not implemented: navigation')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})