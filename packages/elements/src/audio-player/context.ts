import type { Ref } from 'vue'
import { inject } from 'vue'

export interface AudioPlayerItem<TData = unknown> {
  id: string | number
  src: string
  data?: TData
}

export interface AudioPlayerApi<TData = unknown> {
  audioRef: Ref<HTMLAudioElement | null>
  activeItem: Ref<AudioPlayerItem<TData> | null>
  duration: Ref<number | undefined>
  error: Ref<MediaError | null>
  isPlaying: Ref<boolean>
  isBuffering: Ref<boolean>
  playbackRate: Ref<number>
  isItemActive: (id: string | number | null) => boolean
  setActiveItem: (item: AudioPlayerItem<TData> | null) => Promise<void>
  play: (item?: AudioPlayerItem<TData> | null) => Promise<void>
  pause: () => Promise<void>
  seek: (time: number) => void
  setPlaybackRate: (rate: number) => void
}

export const AudioPlayerKey = Symbol('AudioPlayer')

export function useAudioPlayer<TData = unknown>(): AudioPlayerApi<TData> {
  const api = inject<AudioPlayerApi<TData> | null>(AudioPlayerKey)
  if (!api) {
    throw new Error('useAudioPlayer must be used within an AudioPlayer')
  }
  return api!
}

export const AudioPlayerTimeKey = Symbol('AudioPlayerTime')

export function useAudioPlayerTime(): Ref<number> {
  const time = inject<Ref<number> | null>(AudioPlayerTimeKey)
  if (!time) {
    throw new Error(
      'useAudioPlayerTime cannot be called outside of AudioPlayer',
    )
  }
  return time
}

export function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const formattedMins = mins < 10 ? `0${mins}` : mins
  const formattedSecs = secs < 10 ? `0${secs}` : secs

  return hrs > 0
    ? `${hrs}:${formattedMins}:${formattedSecs}`
    : `${mins}:${formattedSecs}`
}
