import { Multiaddr } from 'multiaddr'

export type MatchesFunction = (a: string | Uint8Array | Multiaddr) => boolean
export type PartialMatchesFunction = (protos: string[]) => boolean | string[] | null

export interface Mafmt {
  toString: () => string
  input?: (Mafmt | (() => Mafmt))[]
  matches: MatchesFunction
  partialMatch: PartialMatchesFunction
}
