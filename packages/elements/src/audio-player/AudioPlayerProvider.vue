<script setup lang="ts" generic="TData = unknown">
import type { AudioPlayerApi, AudioPlayerItem } from './useAudioPlayer'
import { useRafFn } from '@vueuse/core'
import { onBeforeUnmount, provide, ref, shallowRef } from 'vue'
import { AudioPlayerKey } from './useAudioPlayer'

const ReadyState = {
  HAVE_NOTHING: 0,
  HAVE_METADATA: 1,
  HAVE_CURRENT_DATA: 2,
  HAVE_FUTURE_DATA: 3,
  HAVE_ENOUGH_DATA: 4,
}

const NetworkState = {
  NETWORK_EMPTY: 0,
  NETWORK_IDLE: 1,
  NETWORK_LOADING: 2,
  NETWORK_NO_SOURCE: 3,
}

const audioRef = ref<HTMLAudioElement | null>(null)
const activeItem = shallowRef<AudioPlayerItem<TData> | null>(null)
const duration = ref<number | undefined>(undefined)
const currentTime = ref(0)
const error = ref<MediaError | null>(null)
const isPlaying = ref(false)
const isBuffering = ref(false)
const playbackRate = ref(1)

// Internal state tracking
const readyState = ref(0)
const networkState = ref(0)
const playPromise = ref<Promise<void> | null>(null)

// Animation Frame Loop to sync state
const { pause: pauseRaf } = useRafFn(() => {
  if (!audioRef.value)
    return

  const audio = audioRef.value
  readyState.value = audio.readyState
  networkState.value = audio.networkState
  currentTime.value = audio.currentTime
  duration.value = audio.duration
  isPlaying.value = !audio.paused
  error.value = audio.error
  playbackRate.value = audio.playbackRate

  isBuffering.value = readyState.value < ReadyState.HAVE_FUTURE_DATA
    && networkState.value === NetworkState.NETWORK_LOADING
})

// Methods
function isItemActive(id: string | number | null) {
  return activeItem.value?.id === id
}

async function setActiveItem(item: AudioPlayerItem<TData> | null) {
  if (!audioRef.value)
    return

  if (item?.id === activeItem.value?.id)
    return

  activeItem.value = item
  const currentRate = audioRef.value.playbackRate

  audioRef.value.pause()
  audioRef.value.currentTime = 0

  if (item === null) {
    audioRef.value.removeAttribute('src')
  }
  else {
    audioRef.value.src = item.src
  }

  audioRef.value.load()
  audioRef.value.playbackRate = currentRate
}

async function play(item?: AudioPlayerItem<TData> | null) {
  if (!audioRef.value)
    return

  // Handle existing promise
  if (playPromise.value) {
    try {
      await playPromise.value
    }
    catch (err) {
      console.error('Previous play promise error:', err)
    }
  }

  // Just resume if no item passed
  if (item === undefined) {
    playPromise.value = audioRef.value.play()
    return playPromise.value
  }

  // If same item, just resume
  if (item?.id === activeItem.value?.id) {
    playPromise.value = audioRef.value.play()
    return playPromise.value
  }

  // New item logic
  activeItem.value = item || null
  const currentRate = audioRef.value.playbackRate

  if (!audioRef.value.paused) {
    audioRef.value.pause()
  }

  audioRef.value.currentTime = 0

  if (item === null) {
    audioRef.value.removeAttribute('src')
  }
  else if (item) {
    audioRef.value.src = item.src
  }

  audioRef.value.load()
  audioRef.value.playbackRate = currentRate

  // Wait for load before playing to be safe, or just play
  playPromise.value = audioRef.value.play()
  return playPromise.value
}

async function pause() {
  if (!audioRef.value)
    return

  if (playPromise.value) {
    try {
      await playPromise.value
    }
    catch (e) {
      console.error(e)
    }
  }

  audioRef.value.pause()
  playPromise.value = null
}

function seek(time: number) {
  if (!audioRef.value)
    return
  audioRef.value.currentTime = time
  currentTime.value = time // Optimistic update
}

function setPlaybackRate(rate: number) {
  if (!audioRef.value)
    return
  audioRef.value.playbackRate = rate
  playbackRate.value = rate
}

const api: AudioPlayerApi<TData> = {
  audioRef,
  activeItem,
  duration,
  currentTime,
  error,
  isPlaying,
  isBuffering,
  playbackRate,
  isItemActive,
  setActiveItem,
  play,
  pause,
  seek,
  setPlaybackRate,
}

provide(AudioPlayerKey, api)

onBeforeUnmount(() => {
  pauseRaf()
})
</script>

<template>
  <audio ref="audioRef" class="hidden" crossorigin="anonymous" />
  <slot />
</template>
