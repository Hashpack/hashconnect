import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  detectOpenHandles: true,
  fakeTimers: {
    enableGlobally: true,
  },
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
}

export default config
