import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface ScrubBarContextValue {
  duration: Ref<number>
  value: Ref<number>
  progress: Ref<number>
  onScrub?: (time: number) => void
  onScrubStart?: () => void
  onScrubEnd?: () => void
}

export const ScrubBarKey: InjectionKey<ScrubBarContextValue> = Symbol('ScrubBar')

export function useScrubBar() {
  const context = inject(ScrubBarKey)
  if (!context) {
    throw new Error('useScrubBar must be used within a ScrubBarContainer')
  }
  return context
}

export function formatTimestamp(value: number) {
  if (!Number.isFinite(value) || value < 0)
    return '0:00'
  const totalSeconds = Math.floor(value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
