<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { onMounted, onUnmounted, ref, watch } from 'vue'

export interface WaveformProps extends /* @vue-ignore */ HTMLAttributes {
  data?: number[]
  barWidth?: number
  barHeight?: number
  barGap?: number
  barRadius?: number
  barColor?: string
  fadeEdges?: boolean
  fadeWidth?: number
  height?: string | number
  active?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<WaveformProps>(), {
  data: () => [],
  barWidth: 4,
  barHeight: 4,
  barGap: 2,
  barRadius: 2,
  fadeEdges: true,
  fadeWidth: 24,
  height: 128,
  active: false,
})

const emit = defineEmits<{
  barClick: [index: number, value: number]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
let resizeObserver: ResizeObserver | null = null

function renderWaveform() {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx)
    return

  const rect = canvas.getBoundingClientRect()
  ctx.clearRect(0, 0, rect.width, rect.height)

  const computedBarColor = props.barColor
    || getComputedStyle(canvas).getPropertyValue('--foreground')
    || '#000'

  const barCount = Math.floor(rect.width / (props.barWidth + props.barGap))
  const centerY = rect.height / 2

  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor((i / barCount) * props.data.length)
    const value = props.data[dataIndex] || 0
    const barHeight = Math.max(props.barHeight, value * rect.height * 0.8)
    const x = i * (props.barWidth + props.barGap)
    const y = centerY - barHeight / 2

    ctx.fillStyle = computedBarColor
    ctx.globalAlpha = 0.3 + value * 0.7

    if (props.barRadius > 0) {
      ctx.beginPath()
      if ('roundRect' in ctx) {
        ctx.roundRect(x, y, props.barWidth, barHeight, props.barRadius)
      }
      else {
        // Fallback for browsers not supporting roundRect
        (ctx as CanvasRenderingContext2D).fillRect(x, y, props.barWidth, barHeight)
      }
      ctx.fill()
    }
    else {
      ctx.fillRect(x, y, props.barWidth, barHeight)
    }
  }

  if (props.fadeEdges && props.fadeWidth > 0 && rect.width > 0) {
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
}

onMounted(() => {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas)
    return

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
      renderWaveform()
    }
  })

  resizeObserver.observe(container)
  renderWaveform()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => [
  props.data,
  props.barWidth,
  props.barHeight,
  props.barGap,
  props.barRadius,
  props.barColor,
  props.fadeEdges,
  props.fadeWidth,
], renderWaveform, { deep: true })

function handleClick(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas)
    return

  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const barIndex = Math.floor(x / (props.barWidth + props.barGap))
  const dataIndex = Math.floor(
    (barIndex * props.data.length) / Math.floor(rect.width / (props.barWidth + props.barGap)),
  )

  if (dataIndex >= 0 && dataIndex < props.data.length) {
    emit('barClick', dataIndex, props.data[dataIndex])
  }
}
</script>

<template>
  <div
    ref="containerRef"
    :class="cn('relative', props.class)"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
  >
    <canvas
      ref="canvasRef"
      class="block h-full w-full"
      @click="handleClick"
    />
  </div>
</template>
