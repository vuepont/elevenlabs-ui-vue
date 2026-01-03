import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export interface SpeechInputData {
  /** The current partial (in-progress) transcript */
  partialTranscript: string
  /** Array of all committed (finalized) transcripts */
  committedTranscripts: string[]
  /** Full transcript combining committed and partial transcripts */
  transcript: string
}

export type ButtonSize = 'default' | 'sm' | 'lg' | null | undefined

export interface SpeechInputContextValue {
  isConnected: boolean
  isConnecting: boolean
  transcript: string
  partialTranscript: string
  committedTranscripts: string[]
  error: string | null
  start: () => Promise<void>
  stop: () => void
  cancel: () => void
  size: ButtonSize
}

export const SpeechInputContextKey: InjectionKey<SpeechInputContextValue> = Symbol('SpeechInputContext')

export function useSpeechInput() {
  const context = inject(SpeechInputContextKey)
  if (!context) {
    throw new Error('SpeechInput compound components must be used within a SpeechInput')
  }
  return context
}

export function buildTranscript({
  partialTranscript,
  committedTranscripts,
}: {
  partialTranscript: string
  committedTranscripts: string[]
}): string {
  const committed = committedTranscripts.join(' ').trim()
  const partial = partialTranscript.trim()

  if (committed && partial) {
    return `${committed} ${partial}`
  }
  return committed || partial
}

export function buildData({
  partialTranscript,
  committedTranscripts,
}: {
  partialTranscript: string
  committedTranscripts: string[]
}): SpeechInputData {
  return {
    partialTranscript,
    committedTranscripts,
    transcript: buildTranscript({ partialTranscript, committedTranscripts }),
  }
}
