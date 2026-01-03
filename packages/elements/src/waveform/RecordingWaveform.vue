<script setup lang="ts">
import type { WaveformProps } from './Waveform.vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { onMounted, onUnmounted, ref, watch } from 'vue'

interface Props extends WaveformProps {
  recording?: boolean
  fftSize?: number
  smoothingTimeConstant?: number
  sensitivity?: number
  updateRate?: number
  showHandle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  recording: false,
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  sensitivity: 1,
  updateRate: 50,
  showHandle: true,
  barWidth: 3,
  barHeight: 4,
  barGap: 1,
  barRadius: 1,
  height: 128,
})

const emit = defineEmits<{
  error: [error: Error]
  recordingComplete: [data: number[]]
}>()

const recordedData = ref<number[]>([])
const viewPosition = ref(1)
const isDragging = ref(false)
const isRecordingComplete = ref(false)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const recordingData = ref<number[]>([])

const analyserRef = ref<AnalyserNode | null>(null)
const audioContextRef = ref<AudioContext | null>(null)
const streamRef = ref<MediaStream | null>(null)
let animationId: number | null = null
const lastUpdate = ref(0)
let resizeObserver: ResizeObserver | null = null

watch(() => props.recording, (isRecording) => {
  if (!isRecording) {
    if (streamRef.value) {
      streamRef.value.getTracks().forEach(track => track.stop())
      streamRef.value = null
    }
    if (audioContextRef.value && audioContextRef.value.state !== 'closed') {
      audioContextRef.value.close()
      audioContextRef.value = null
    }

    if (recordingData.value.length > 0) {
      recordedData.value = [...recordingData.value]
      isRecordingComplete.value = true
      emit('recordingComplete', recordingData.value)
    }
    return
  }

  isRecordingComplete.value = false
  recordingData.value = []
  recordedData.value = []
  viewPosition.value = 1

  const setupMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.value = stream

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContextClass()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = props.fftSize
      analyser.smoothingTimeConstant = props.smoothingTimeConstant

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      audioContextRef.value = audioContext
      analyserRef.value = analyser
    }
    catch (error) {
      emit('error', error as Error)
    }
  }

  setupMicrophone()
})

function animate(currentTime: number) {
  const canvas = canvasRef.value
  if (!canvas)
    return

  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  if (props.recording && currentTime - lastUpdate.value > props.updateRate) {
    lastUpdate.value = currentTime

    if (analyserRef.value) {
      const dataArray = new Uint8Array(analyserRef.value.frequencyBinCount)
      analyserRef.value.getByteFrequencyData(dataArray)

      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const average = (sum / dataArray.length / 255) * props.sensitivity

      recordingData.value.push(Math.min(1, Math.max(0.05, average)))
    }
  }

  const rect = canvas.getBoundingClientRect()
  ctx.clearRect(0, 0, rect.width, rect.height)

  const computedBarColor = props.barColor
    || getComputedStyle(canvas).getPropertyValue('--foreground')
    || '#000'

  const dataToRender = props.recording ? recordingData.value : recordedData.value

  if (dataToRender.length > 0) {
    const step = props.barWidth + props.barGap
    const barsVisible = Math.floor(rect.width / step)
    const centerY = rect.height / 2

    let startIndex = 0
    if (!props.recording && isRecordingComplete.value) {
      const totalBars = dataToRender.length
      if (totalBars > barsVisible) {
        startIndex = Math.floor((totalBars - barsVisible) * viewPosition.value)
      }
    }
    else if (props.recording) {
      startIndex = Math.max(0, dataToRender.length - barsVisible)
    }

    for (let i = 0; i < barsVisible && startIndex + i < dataToRender.length; i++) {
      const value = dataToRender[startIndex + i] || 0.1
      const x = i * step
      const barHeight = Math.max(props.barHeight, value * rect.height * 0.7)
      const y = centerY - barHeight / 2

      ctx.fillStyle = computedBarColor
      ctx.globalAlpha = 0.3 + value * 0.7

      if (props.barRadius > 0) {
        ctx.beginPath()
        if ('roundRect' in ctx) {
          ctx.roundRect(x, y, props.barWidth, barHeight, props.barRadius)
        }
        else {
          (ctx as CanvasRenderingContext2D).fillRect(x, y, props.barWidth, barHeight)
        }
        ctx.fill()
      }
      else {
        ctx.fillRect(x, y, props.barWidth, barHeight)
      }
    }

    if (!props.recording && isRecordingComplete.value && props.showHandle) {
      const indicatorX = rect.width * viewPosition.value

      ctx.strokeStyle = computedBarColor
      ctx.globalAlpha = 0.5
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(indicatorX, 0)
      ctx.lineTo(indicatorX, rect.height)
      ctx.stroke()
      ctx.fillStyle = computedBarColor
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(indicatorX, centerY, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.globalAlpha = 1
  animationId = requestAnimationFrame(animate)
}

function handleScrub(clientX: number) {
  const container = containerRef.value
  if (!container || props.recording || !isRecordingComplete.value)
    return

  const rect = container.getBoundingClientRect()
  const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
  const position = x / rect.width

  viewPosition.value = position
}

function handleMouseDown(e: MouseEvent) {
  if (props.recording || !isRecordingComplete.value)
    return

  e.preventDefault()
  isDragging.value = true
  handleScrub(e.clientX)
}

function handleMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    handleScrub(e.clientX)
  }
}

function handleMouseUp() {
  isDragging.value = false
}

onMounted(() => {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (container && canvas) {
    resizeObserver = new ResizeObserver(() => {
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
    })
    resizeObserver.observe(container)
  }

  animationId = requestAnimationFrame(animate)

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  if (resizeObserver)
    resizeObserver.disconnect()
  if (animationId)
    cancelAnimationFrame(animationId)

  if (streamRef.value) {
    streamRef.value.getTracks().forEach(track => track.stop())
  }
  if (audioContextRef.value && audioContextRef.value.state !== 'closed') {
    audioContextRef.value.close()
  }

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div
    ref="containerRef"
    :class="cn(
      'relative flex items-center',
      isRecordingComplete && !recording && 'cursor-pointer',
      props.class,
    )"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
    :role="isRecordingComplete && !recording ? 'slider' : undefined"
    :aria-label="isRecordingComplete && !recording ? 'Drag to scrub through recording' : undefined"
    :aria-valuenow="isRecordingComplete && !recording ? viewPosition * 100 : undefined"
    :aria-valuemin="isRecordingComplete && !recording ? 0 : undefined"
    :aria-valuemax="isRecordingComplete && !recording ? 100 : undefined"
    :tabindex="isRecordingComplete && !recording ? 0 : undefined"
    @mousedown="handleMouseDown"
  >
    <canvas ref="canvasRef" class="block h-full w-full" />
  </div>
</template>
