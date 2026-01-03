<!-- eslint-disable style/max-statements-per-line -->
<script setup lang="ts">
import type { ScrollingWaveformProps } from './ScrollingWaveform.vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { onMounted, onUnmounted, ref, watch } from 'vue'

interface Props extends Omit<ScrollingWaveformProps, 'barCount'> {
  active?: boolean
  fftSize?: number
  smoothingTimeConstant?: number
  sensitivity?: number
  historySize?: number
  updateRate?: number
  savedHistory?: number[]
  dragOffset?: number
  enableAudioPlayback?: boolean
  playbackRate?: number
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  sensitivity: 1,
  historySize: 150,
  updateRate: 50,
  barWidth: 3,
  barHeight: 4,
  barGap: 1,
  barRadius: 1,
  fadeEdges: true,
  fadeWidth: 24,
  height: 128,
  dragOffset: undefined,
  enableAudioPlayback: true,
  playbackRate: 1,
})

const emit = defineEmits<{
  'error': [error: Error]
  'update:dragOffset': [offset: number]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const internalHistory = ref<number[]>([])
// Use savedHistory if provided (treated as mutable array), otherwise internal
const history = ref<number[]>(props.savedHistory || internalHistory.value)

const analyserRef = ref<AnalyserNode | null>(null)
const audioContextRef = ref<AudioContext | null>(null)
const streamRef = ref<MediaStream | null>(null)
let animationId: number | null = null
const lastUpdate = ref(0)
const internalDragOffset = ref(0)
const isDragging = ref(false)
const playbackPosition = ref<number | null>(null)
const dragStartX = ref(0)
const dragStartOffset = ref(0)
const playbackStartTime = ref(0)

// Audio recording and playback refs
const mediaRecorderRef = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const audioBuffer = ref<AudioBuffer | null>(null)
const sourceNode = ref<AudioBufferSourceNode | null>(null)
const scrubSource = ref<AudioBufferSourceNode | null>(null)

let resizeObserver: ResizeObserver | null = null

// Computed property for dragOffset to handle v-model or internal state
const currentDragOffset = ref(props.dragOffset ?? internalDragOffset.value)

watch(() => props.dragOffset, (val) => {
  if (val !== undefined)
    currentDragOffset.value = val
})

function updateDragOffset(val: number) {
  if (props.dragOffset !== undefined) {
    emit('update:dragOffset', val)
  }
  else {
    internalDragOffset.value = val
    currentDragOffset.value = val
  }
}

async function processAudioBlob(blob: Blob) {
  try {
    const arrayBuffer = await blob.arrayBuffer()
    if (audioContextRef.value) {
      const decodedBuffer = await audioContextRef.value.decodeAudioData(arrayBuffer)
      audioBuffer.value = decodedBuffer
    }
  }
  catch (error) {
    console.error('Error processing audio:', error)
  }
}

function playScrubSound(position: number, direction: number) {
  if (!props.enableAudioPlayback || !audioBuffer.value || !audioContextRef.value)
    return

  if (scrubSource.value) {
    try {
      scrubSource.value.stop()
    }
    catch {}
  }

  const source = audioContextRef.value.createBufferSource()
  source.buffer = audioBuffer.value

  const speed = Math.abs(direction)
  const rate = direction > 0
    ? Math.min(3, 1 + speed * 0.1)
    : Math.max(-3, -1 - speed * 0.1)

  source.playbackRate.value = rate

  const filter = audioContextRef.value.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = Math.max(200, 2000 - speed * 100)

  source.connect(filter)
  filter.connect(audioContextRef.value.destination)

  const startTime = Math.max(0, Math.min(position, audioBuffer.value.duration - 0.1))
  source.start(0, startTime, 0.1)
  scrubSource.value = source
}

function playFromPosition(position: number) {
  if (!props.enableAudioPlayback || !audioBuffer.value || !audioContextRef.value)
    return

  if (sourceNode.value) {
    try {
      sourceNode.value.stop()
    }
    catch {}
  }

  const source = audioContextRef.value.createBufferSource()
  source.buffer = audioBuffer.value
  source.playbackRate.value = props.playbackRate
  source.connect(audioContextRef.value.destination)

  const startTime = Math.max(0, Math.min(position, audioBuffer.value.duration))
  source.start(0, startTime)
  sourceNode.value = source

  playbackStartTime.value = audioContextRef.value.currentTime - startTime
  playbackPosition.value = startTime

  source.onended = () => {
    playbackPosition.value = null
  }
}

// Playback visualization loop
let playbackAnimationId: number | null = null
function updatePlaybackVisual() {
  if (
    audioContextRef.value
    && sourceNode.value
    && audioBuffer.value
    && playbackPosition.value !== null
  ) {
    const elapsed = audioContextRef.value.currentTime - playbackStartTime.value
    const currentPos = playbackPosition.value + elapsed * props.playbackRate

    if (currentPos < audioBuffer.value.duration) {
      const progressRatio = currentPos / audioBuffer.value.duration
      const currentBarIndex = Math.floor(progressRatio * history.value.length)
      const step = props.barWidth + props.barGap

      const containerWidth = containerRef.value?.getBoundingClientRect().width || 0
      const viewBars = Math.floor(containerWidth / step)
      const targetOffset = -(currentBarIndex - (history.value.length - viewBars)) * step
      const clampedOffset = Math.max(
        -(history.value.length - viewBars) * step,
        Math.min(0, targetOffset),
      )

      updateDragOffset(clampedOffset)
      playbackAnimationId = requestAnimationFrame(updatePlaybackVisual)
    }
    else {
      playbackPosition.value = null
      const step = props.barWidth + props.barGap
      const containerWidth = containerRef.value?.getBoundingClientRect().width || 0
      const viewBars = Math.floor(containerWidth / step)
      updateDragOffset(-(history.value.length - viewBars) * step)
    }
  }
}

watch(playbackPosition, (val) => {
  if (val !== null) {
    if (playbackAnimationId)
      cancelAnimationFrame(playbackAnimationId)
    playbackAnimationId = requestAnimationFrame(updatePlaybackVisual)
  }
  else {
    if (playbackAnimationId)
      cancelAnimationFrame(playbackAnimationId)
  }
})

// Setup/Teardown Microphone
watch(() => props.active, (isActive) => {
  if (!isActive) {
    if (mediaRecorderRef.value && mediaRecorderRef.value.state !== 'inactive') {
      mediaRecorderRef.value.stop()
    }
    if (streamRef.value) {
      streamRef.value.getTracks().forEach(track => track.stop())
      streamRef.value = null
    }
    // Process recorded audio
    if (props.enableAudioPlayback && audioChunks.value.length > 0) {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      processAudioBlob(audioBlob)
    }
    return
  }

  updateDragOffset(0)
  history.value.length = 0 // Clear array
  audioChunks.value = []
  audioBuffer.value = null
  playbackPosition.value = null

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

      if (props.enableAudioPlayback) {
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.value = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.value.push(event.data)
          }
        }

        mediaRecorder.start(100)
      }
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

  if (props.active && currentTime - lastUpdate.value > props.updateRate) {
    lastUpdate.value = currentTime

    if (analyserRef.value) {
      const dataArray = new Uint8Array(analyserRef.value.frequencyBinCount)
      analyserRef.value.getByteFrequencyData(dataArray)

      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const average = (sum / dataArray.length / 255) * props.sensitivity

      history.value.push(Math.min(1, Math.max(0.05, average)))

      if (history.value.length > props.historySize) {
        history.value.shift()
      }
    }
  }

  const rect = canvas.getBoundingClientRect()
  ctx.clearRect(0, 0, rect.width, rect.height)

  const computedBarColor = props.barColor
    || getComputedStyle(canvas).getPropertyValue('--foreground')
    || '#000'

  const step = props.barWidth + props.barGap
  const barCount = Math.floor(rect.width / step)
  const centerY = rect.height / 2

  const dataToRender = history.value

  if (dataToRender.length > 0) {
    const offsetInBars = Math.floor(currentDragOffset.value / step)

    for (let i = 0; i < barCount; i++) {
      let dataIndex

      if (props.active) {
        dataIndex = dataToRender.length - 1 - i
      }
      else {
        dataIndex = Math.max(
          0,
          Math.min(
            dataToRender.length - 1,
            dataToRender.length - 1 - i - Math.floor(offsetInBars),
          ),
        )
      }

      if (dataIndex >= 0 && dataIndex < dataToRender.length) {
        const value = dataToRender[dataIndex]
        if (value !== undefined) {
          const x = rect.width - (i + 1) * step
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
      }
    }
  }

  if (props.fadeEdges && props.fadeWidth > 0) {
    const gradient = ctx.createLinearGradient(0, 0, rect.width, 0)
    const fadePercent = Math.min(0.2, props.fadeWidth / rect.width)

    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(fadePercent, 'rgba(255,255,255,0)')
    gradient.addColorStop(1 - fadePercent, 'rgba(255,255,255,0)')
    gradient.addColorStop(1, 'rgba(255,255,255,1)')

    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, rect.width, rect.height)
    ctx.globalCompositeOperation = 'source-over'
  }

  ctx.globalAlpha = 1
  animationId = requestAnimationFrame(animate)
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
  if (playbackAnimationId)
    cancelAnimationFrame(playbackAnimationId)

  if (streamRef.value) {
    streamRef.value.getTracks().forEach(track => track.stop())
  }
  if (mediaRecorderRef.value && mediaRecorderRef.value.state !== 'inactive') {
    mediaRecorderRef.value.stop()
  }
  if (audioContextRef.value && audioContextRef.value.state !== 'closed') {
    audioContextRef.value.close()
  }
  if (sourceNode.value) {
    try { sourceNode.value.stop() }
    catch {}
  }
  if (scrubSource.value) {
    try { scrubSource.value.stop() }
    catch {}
  }

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

// Mouse Interaction
let lastScrubTime = 0
let lastMouseX = 0

function handleMouseDown(e: MouseEvent) {
  if (props.active || history.value.length === 0)
    return

  e.preventDefault()
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartOffset.value = currentDragOffset.value
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value)
    return

  const deltaX = e.clientX - dragStartX.value
  const newOffset = dragStartOffset.value - deltaX * 0.5 // Reduce sensitivity

  const step = props.barWidth + props.barGap
  const maxBars = history.value.length
  const viewWidth = canvasRef.value?.getBoundingClientRect().width || 0
  const viewBars = Math.floor(viewWidth / step)

  const maxOffset = Math.max(0, (maxBars - viewBars) * step)
  const minOffset = 0
  const clampedOffset = Math.max(minOffset, Math.min(maxOffset, newOffset))

  updateDragOffset(clampedOffset)

  const now = Date.now()
  if (
    props.enableAudioPlayback
    && audioBuffer.value
    && now - lastScrubTime > 50
  ) {
    lastScrubTime = now
    const offsetBars = Math.floor(clampedOffset / step)
    const rightmostBarIndex = Math.max(
      0,
      Math.min(maxBars - 1, maxBars - 1 - offsetBars),
    )
    const audioPosition = (rightmostBarIndex / maxBars) * audioBuffer.value.duration
    const direction = e.clientX - lastMouseX
    lastMouseX = e.clientX
    playScrubSound(
      Math.max(0, Math.min(audioBuffer.value.duration - 0.1, audioPosition)),
      direction,
    )
  }
}

function handleMouseUp() {
  if (isDragging.value) {
    isDragging.value = false

    if (props.enableAudioPlayback && audioBuffer.value) {
      const step = props.barWidth + props.barGap
      const maxBars = history.value.length
      const offsetBars = Math.floor(currentDragOffset.value / step)
      const rightmostBarIndex = Math.max(
        0,
        Math.min(maxBars - 1, maxBars - 1 - offsetBars),
      )
      const audioPosition = (rightmostBarIndex / maxBars) * audioBuffer.value.duration
      playFromPosition(
        Math.max(0, Math.min(audioBuffer.value.duration - 0.1, audioPosition)),
      )
    }

    if (scrubSource.value) {
      try { scrubSource.value.stop() }
      catch {}
    }
  }
}
</script>

<template>
  <div
    ref="containerRef"
    :class="cn(
      'relative flex items-center',
      !active && history.length > 0 && 'cursor-pointer',
      props.class,
    )"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
    :role="!active && history.length > 0 ? 'slider' : undefined"
    :aria-label="!active && history.length > 0 ? 'Drag to scrub through recording' : undefined"
    :aria-valuenow="!active && history.length > 0 ? Math.abs(currentDragOffset) : undefined"
    :aria-valuemin="!active && history.length > 0 ? 0 : undefined"
    :aria-valuemax="!active && history.length > 0 ? history.length : undefined"
    :tabindex="!active && history.length > 0 ? 0 : undefined"
    @mousedown="handleMouseDown"
  >
    <canvas ref="canvasRef" class="block h-full w-full" />
  </div>
</template>
