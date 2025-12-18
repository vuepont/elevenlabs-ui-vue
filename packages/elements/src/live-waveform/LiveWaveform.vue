<!-- eslint-disable vue/custom-event-name-casing -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

export interface LiveWaveformProps {
  active?: boolean
  processing?: boolean
  deviceId?: string
  barWidth?: number
  barHeight?: number
  barGap?: number
  barRadius?: number
  barColor?: string
  fadeEdges?: boolean
  fadeWidth?: number
  height?: string | number
  sensitivity?: number
  smoothingTimeConstant?: number
  fftSize?: number
  historySize?: number
  updateRate?: number
  mode?: 'scrolling' | 'static'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<LiveWaveformProps>(), {
  active: false,
  processing: false,
  barWidth: 3,
  barGap: 1,
  barRadius: 1.5,
  fadeEdges: true,
  fadeWidth: 24,
  barHeight: 4,
  height: 64,
  sensitivity: 1,
  smoothingTimeConstant: 0.8,
  fftSize: 256,
  historySize: 60,
  updateRate: 30,
  mode: 'static',
})

const emit = defineEmits<{
  (e: 'error', error: Error): void
  (e: 'stream-ready', stream: MediaStream): void
  (e: 'stream-end'): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const audioState = {
  history: [] as number[],
  staticBars: [] as number[],
  lastActiveData: [] as number[],
  analyser: null as AnalyserNode | null,
  audioContext: null as AudioContext | null,
  stream: null as MediaStream | null,
  animationId: 0,
  processingAnimationId: 0,
  lastUpdate: 0,
  transitionProgress: 0,
  needsRedraw: true,
  gradientCache: null as CanvasGradient | null,
  lastWidth: 0,
}

const heightStyle = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
)

// Resize Logic
onMounted(() => {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container)
    return

  const resizeObserver = new ResizeObserver(() => {
    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    audioState.gradientCache = null
    audioState.lastWidth = rect.width
    audioState.needsRedraw = true
  })

  resizeObserver.observe(container)

  onUnmounted(() => {
    resizeObserver.disconnect()
    cleanupAudio()
    if (audioState.animationId)
      cancelAnimationFrame(audioState.animationId)
    if (audioState.processingAnimationId)
      cancelAnimationFrame(audioState.processingAnimationId)
  })
})

// Processing Animation Logic
watch(() => [props.processing, props.active, props.mode], () => {
  // Clear previous processing loop if any
  if (audioState.processingAnimationId) {
    cancelAnimationFrame(audioState.processingAnimationId)
    audioState.processingAnimationId = 0
  }

  if (props.processing && !props.active) {
    let time = 0
    audioState.transitionProgress = 0

    const animateProcessing = () => {
      time += 0.03
      audioState.transitionProgress = Math.min(1, audioState.transitionProgress + 0.02)

      const processingData = []
      const containerWidth = containerRef.value?.getBoundingClientRect().width || 200
      const barCount = Math.floor(containerWidth / (props.barWidth + props.barGap))

      if (props.mode === 'static') {
        const halfCount = Math.floor(barCount / 2)
        for (let i = 0; i < barCount; i++) {
          const normalizedPosition = (i - halfCount) / halfCount
          const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4

          const wave1 = Math.sin(time * 1.5 + normalizedPosition * 3) * 0.25
          const wave2 = Math.sin(time * 0.8 - normalizedPosition * 2) * 0.2
          const wave3 = Math.cos(time * 2 + normalizedPosition) * 0.15
          const combinedWave = wave1 + wave2 + wave3
          const processingValue = (0.2 + combinedWave) * centerWeight

          let finalValue = processingValue
          if (audioState.lastActiveData.length > 0 && audioState.transitionProgress < 1) {
            const lastDataIndex = Math.min(i, audioState.lastActiveData.length - 1)
            const lastValue = audioState.lastActiveData[lastDataIndex] || 0
            finalValue = lastValue * (1 - audioState.transitionProgress) + processingValue * audioState.transitionProgress
          }
          processingData.push(Math.max(0.05, Math.min(1, finalValue)))
        }
        audioState.staticBars = processingData
      }
      else {
        // Scrolling mode processing simulation
        for (let i = 0; i < barCount; i++) {
          const normalizedPosition = (i - barCount / 2) / (barCount / 2)
          const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4

          const wave1 = Math.sin(time * 1.5 + i * 0.15) * 0.25
          const wave2 = Math.sin(time * 0.8 - i * 0.1) * 0.2
          const wave3 = Math.cos(time * 2 + i * 0.05) * 0.15
          const combinedWave = wave1 + wave2 + wave3
          const processingValue = (0.2 + combinedWave) * centerWeight

          let finalValue = processingValue
          if (audioState.lastActiveData.length > 0 && audioState.transitionProgress < 1) {
            const lastDataIndex = Math.floor((i / barCount) * audioState.lastActiveData.length)
            const lastValue = audioState.lastActiveData[lastDataIndex] || 0
            finalValue = lastValue * (1 - audioState.transitionProgress) + processingValue * audioState.transitionProgress
          }
          processingData.push(Math.max(0.05, Math.min(1, finalValue)))
        }
        audioState.history = processingData
      }

      audioState.needsRedraw = true
      audioState.processingAnimationId = requestAnimationFrame(animateProcessing)
    }

    animateProcessing()
  }
  else if (!props.active && !props.processing) {
    // Fade out logic
    const hasData = props.mode === 'static'
      ? audioState.staticBars.length > 0
      : audioState.history.length > 0

    if (hasData) {
      let fadeProgress = 0
      const fadeToIdle = () => {
        fadeProgress += 0.03
        if (fadeProgress < 1) {
          if (props.mode === 'static') {
            audioState.staticBars = audioState.staticBars.map(v => v * (1 - fadeProgress))
          }
          else {
            audioState.history = audioState.history.map(v => v * (1 - fadeProgress))
          }
          audioState.needsRedraw = true
          requestAnimationFrame(fadeToIdle)
        }
        else {
          if (props.mode === 'static') {
            audioState.staticBars = []
          }
          else {
            audioState.history = []
          }
        }
      }
      fadeToIdle()
    }
  }
})

// Microphone Setup
function cleanupAudio() {
  if (audioState.stream) {
    audioState.stream.getTracks().forEach(track => track.stop())
    audioState.stream = null
    emit('stream-end')
  }
  if (audioState.audioContext && audioState.audioContext.state !== 'closed') {
    audioState.audioContext.close()
    audioState.audioContext = null
  }
}

watch(() => [props.active, props.deviceId], async () => {
  if (!props.active) {
    cleanupAudio()
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: props.deviceId
        ? {
            deviceId: { exact: props.deviceId },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
    })

    audioState.stream = stream
    emit('stream-ready', stream)

    const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext
    const audioContext = new AudioContextConstructor()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = props.fftSize
    analyser.smoothingTimeConstant = props.smoothingTimeConstant

    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)

    audioState.audioContext = audioContext
    audioState.analyser = analyser
    audioState.history = [] // Clear history on start
  }
  catch (error) {
    emit('error', error as Error)
  }
}, { immediate: true })

// Main Animation Loop
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas)
    return

  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  const animate = (currentTime: number) => {
    const rect = canvas.getBoundingClientRect()

    // 1. Update Data (if active)
    if (props.active && currentTime - audioState.lastUpdate > props.updateRate) {
      audioState.lastUpdate = currentTime

      if (audioState.analyser) {
        const dataArray = new Uint8Array(audioState.analyser.frequencyBinCount)
        audioState.analyser.getByteFrequencyData(dataArray)

        if (props.mode === 'static') {
          const startFreq = Math.floor(dataArray.length * 0.05)
          const endFreq = Math.floor(dataArray.length * 0.4)
          const relevantData = dataArray.slice(startFreq, endFreq)

          const barCount = Math.floor(rect.width / (props.barWidth + props.barGap))
          const halfCount = Math.floor(barCount / 2)
          const newBars: number[] = []

          // Mirror data
          for (let i = halfCount - 1; i >= 0; i--) {
            const dataIndex = Math.floor((i / halfCount) * relevantData.length)
            const value = Math.min(1, (relevantData[dataIndex] / 255) * props.sensitivity)
            newBars.push(Math.max(0.05, value))
          }
          for (let i = 0; i < halfCount; i++) {
            const dataIndex = Math.floor((i / halfCount) * relevantData.length)
            const value = Math.min(1, (relevantData[dataIndex] / 255) * props.sensitivity)
            newBars.push(Math.max(0.05, value))
          }

          audioState.staticBars = newBars
          audioState.lastActiveData = newBars
        }
        else {
          // Scrolling mode
          let sum = 0
          const startFreq = Math.floor(dataArray.length * 0.05)
          const endFreq = Math.floor(dataArray.length * 0.4)
          const relevantData = dataArray.slice(startFreq, endFreq)

          for (let i = 0; i < relevantData.length; i++) {
            sum += relevantData[i]
          }
          const average = (sum / relevantData.length / 255) * props.sensitivity

          audioState.history.push(Math.min(1, Math.max(0.05, average)))
          audioState.lastActiveData = [...audioState.history]

          if (audioState.history.length > props.historySize) {
            audioState.history.shift()
          }
        }
        audioState.needsRedraw = true
      }
    }

    // 2. Render (if needed)
    if (audioState.needsRedraw || props.active) {
      audioState.needsRedraw = props.active // If active, always request next frame

      ctx.clearRect(0, 0, rect.width, rect.height)

      const computedBarColor = props.barColor || (() => {
        const style = getComputedStyle(canvas)
        return style.color || '#000'
      })()

      const step = props.barWidth + props.barGap
      const barCount = Math.floor(rect.width / step)
      const centerY = rect.height / 2

      // Determine which data array to draw
      let dataToRender: number[] = []
      if (props.mode === 'static') {
        dataToRender = props.processing
          ? audioState.staticBars
          : props.active
            ? audioState.staticBars
            : audioState.staticBars.length > 0
              ? audioState.staticBars
              : []
      }
      else {
        dataToRender = audioState.history
      }

      // Draw Loop
      for (let i = 0; i < barCount && i < (props.mode === 'static' ? dataToRender.length : Infinity); i++) {
        let value = 0.1
        let x = 0

        if (props.mode === 'static') {
          value = dataToRender[i] || 0.1
          x = i * step
        }
        else {
          // Scrolling: draw from right to left
          if (i < audioState.history.length) {
            const dataIndex = audioState.history.length - 1 - i
            value = audioState.history[dataIndex] || 0.1
          }
          x = rect.width - (i + 1) * step
        }

        const barHeight = Math.max(props.barHeight, value * rect.height * 0.8)
        const y = centerY - barHeight / 2

        ctx.fillStyle = computedBarColor
        ctx.globalAlpha = 0.4 + value * 0.6

        if (props.barRadius > 0) {
          ctx.beginPath()
          if ('roundRect' in ctx) {
            ;(ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(x, y, props.barWidth, barHeight, props.barRadius)
          }
          else {
            ;(ctx as CanvasRenderingContext2D).fillRect(x, y, props.barWidth, barHeight)
          }
          ctx.fill()
        }
        else {
          ctx.fillRect(x, y, props.barWidth, barHeight)
        }
      }

      // Edge Fading
      if (props.fadeEdges && props.fadeWidth > 0 && rect.width > 0) {
        if (!audioState.gradientCache || audioState.lastWidth !== rect.width) {
          const gradient = ctx.createLinearGradient(0, 0, rect.width, 0)
          const fadePercent = Math.min(0.3, props.fadeWidth / rect.width)
          gradient.addColorStop(0, 'rgba(255,255,255,1)')
          gradient.addColorStop(fadePercent, 'rgba(255,255,255,0)')
          gradient.addColorStop(1 - fadePercent, 'rgba(255,255,255,0)')
          gradient.addColorStop(1, 'rgba(255,255,255,1)')
          audioState.gradientCache = gradient
          audioState.lastWidth = rect.width
        }

        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = audioState.gradientCache
        ctx.fillRect(0, 0, rect.width, rect.height)
        ctx.globalCompositeOperation = 'source-over'
      }

      ctx.globalAlpha = 1
    }

    audioState.animationId = requestAnimationFrame(animate)
  }

  audioState.animationId = requestAnimationFrame(animate)
})
</script>

<template>
  <div
    ref="containerRef"
    :class="cn('relative h-full w-full', props.class)"
    :style="{ height: heightStyle }"
    :aria-label="active ? 'Live audio waveform' : processing ? 'Processing audio' : 'Audio waveform idle'"
    role="img"
  >
    <div
      v-if="!active && !processing"
      class="border-muted-foreground/20 absolute top-1/2 right-0 left-0 -translate-y-1/2 border-t-2 border-dotted"
    />

    <canvas
      ref="canvasRef"
      class="block h-full w-full"
      aria-hidden="true"
    />
  </div>
</template>
