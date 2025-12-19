import type { MaybeRef, Ref } from 'vue'
import { useRafFn } from '@vueuse/core'
import { computed, onUnmounted, ref, toValue, watch } from 'vue'

export interface AudioAnalyserOptions {
  fftSize?: number
  smoothingTimeConstant?: number
  minDecibels?: number
  maxDecibels?: number
}

export interface MultiBandVolumeOptions {
  bands?: number
  loPass?: number
  hiPass?: number
  updateInterval?: number
  analyserOptions?: AudioAnalyserOptions
}

export type AgentState
  = | 'connecting'
    | 'initializing'
    | 'listening'
    | 'speaking'
    | 'thinking'
    | undefined

function createAudioAnalyser(
  mediaStream: MediaStream,
  options: AudioAnalyserOptions = {},
) {
  if (typeof window === 'undefined')
    return null

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  const audioContext = new AudioContextClass()
  const source = audioContext.createMediaStreamSource(mediaStream)
  const analyser = audioContext.createAnalyser()

  if (options.fftSize)
    analyser.fftSize = options.fftSize
  if (options.smoothingTimeConstant !== undefined) {
    analyser.smoothingTimeConstant = options.smoothingTimeConstant
  }
  if (options.minDecibels !== undefined)
    analyser.minDecibels = options.minDecibels
  if (options.maxDecibels !== undefined)
    analyser.maxDecibels = options.maxDecibels

  source.connect(analyser)

  const cleanup = () => {
    source.disconnect()
    if (audioContext.state !== 'closed') {
      audioContext.close()
    }
  }

  return { analyser, audioContext, cleanup }
}

function normalizeDb(value: number) {
  if (value === -Infinity)
    return 0
  const minDb = -100
  const maxDb = -10
  const db = 1 - (Math.max(minDb, Math.min(maxDb, value)) * -1) / 100
  return Math.sqrt(db)
}

/**
 * Composable for tracking volume across multiple frequency bands
 */
export function useMultibandVolume(
  mediaStream: Ref<MediaStream | null | undefined>,
  options: MultiBandVolumeOptions = {},
) {
  const bands = options.bands ?? 5
  const frequencyBands = ref<number[]>(new Array(bands).fill(0))
  let cleanupAudio: (() => void) | undefined
  let activeContext: { analyser: AnalyserNode, dataArray: Float32Array<ArrayBuffer> } | null = null
  let lastUpdate = 0

  const multibandDefaults: MultiBandVolumeOptions = {
    bands: 5,
    loPass: 100,
    hiPass: 600,
    updateInterval: 32,
    analyserOptions: { fftSize: 2048 },
  }

  const opts = computed(() => ({ ...multibandDefaults, ...options }))

  const { pause: pauseLoop, resume: resumeLoop } = useRafFn(({ timestamp }) => {
    if (!activeContext)
      return
    const { analyser, dataArray } = activeContext
    const updateInterval = opts.value.updateInterval!

    if (timestamp - lastUpdate >= updateInterval) {
      analyser.getFloatFrequencyData(dataArray)

      const sliceStart = opts.value.loPass!
      const sliceEnd = opts.value.hiPass!
      const bandsCount = opts.value.bands!
      const sliceLength = sliceEnd - sliceStart
      const chunkSize = Math.ceil(sliceLength / bandsCount)
      const chunks = new Array(bandsCount)

      for (let i = 0; i < bandsCount; i++) {
        let sum = 0
        let count = 0
        const startIdx = sliceStart + i * chunkSize
        const endIdx = Math.min(sliceStart + (i + 1) * chunkSize, sliceEnd)

        for (let j = startIdx; j < endIdx; j++) {
          sum += normalizeDb(dataArray[j])
          count++
        }
        chunks[i] = count > 0 ? sum / count : 0
      }

      let hasChanged = false
      for (let i = 0; i < chunks.length; i++) {
        if (Math.abs(chunks[i] - frequencyBands.value[i]) > 0.01) {
          hasChanged = true
          break
        }
      }

      if (hasChanged) {
        frequencyBands.value = chunks
      }
      lastUpdate = timestamp
    }
  }, { immediate: false })

  watch(
    () => mediaStream.value,
    (stream) => {
      pauseLoop()
      if (cleanupAudio)
        cleanupAudio()
      activeContext = null

      if (!stream) {
        frequencyBands.value = new Array(opts.value.bands).fill(0)
        return
      }

      const audioSetup = createAudioAnalyser(stream, opts.value.analyserOptions)
      if (!audioSetup)
        return

      cleanupAudio = audioSetup.cleanup
      const bufferLength = audioSetup.analyser.frequencyBinCount
      const dataArray = new Float32Array(bufferLength) as Float32Array<ArrayBuffer>
      activeContext = { analyser: audioSetup.analyser, dataArray }
      resumeLoop()
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (cleanupAudio)
      cleanupAudio()
  })

  return frequencyBands
}

/**
 * Composable for orchestrating the visual animations
 */
export function useBarAnimator(
  state: Ref<AgentState>,
  columns: number,
  interval: MaybeRef<number>,
) {
  const currentFrame = ref<number[]>([])
  const indexRef = ref(0)

  // track startTime manually to handle resets
  let startTime = performance.now()

  const generateConnectingSequenceBar = (cols: number): number[][] => {
    const seq = []
    for (let x = 0; x < cols; x++) {
      seq.push([x, cols - 1 - x])
    }
    return seq
  }

  const generateListeningSequenceBar = (cols: number): number[][] => {
    const center = Math.floor(cols / 2)
    return [[center], [-1]]
  }

  const sequence = computed(() => {
    if (state.value === 'thinking' || state.value === 'listening') {
      return generateListeningSequenceBar(columns)
    }
    else if (state.value === 'connecting' || state.value === 'initializing') {
      return generateConnectingSequenceBar(columns)
    }
    else if (state.value === undefined || state.value === 'speaking') {
      return [new Array(columns).fill(0).map((_, idx) => idx)]
    }
    else {
      return [[]]
    }
  })

  // Reset index and timer when sequence changes
  watch(sequence, (newSeq) => {
    indexRef.value = 0
    currentFrame.value = newSeq[0] || []
    startTime = performance.now()
  }, { flush: 'sync' }) // sync flush ensures we reset before next animation frame

  useRafFn(({ timestamp }) => {
    const currentInterval = toValue(interval)
    const timeElapsed = timestamp - startTime

    if (timeElapsed >= currentInterval) {
      // Move to next frame
      indexRef.value = (indexRef.value + 1) % sequence.value.length
      currentFrame.value = sequence.value[indexRef.value] || []

      // Reset timer to current timestamp (step)
      startTime = timestamp
    }
  })

  return currentFrame
}
