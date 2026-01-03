<script setup lang="ts">
import { cn } from '@repo/shadcn-vue/lib/utils'
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  speed?: number
  barCount?: number
  barWidth?: number
  barHeight?: number
  barGap?: number
  barRadius?: number
  barColor?: string
  fadeEdges?: boolean
  fadeWidth?: number
  height?: string | number
  data?: number[]
  class?: string
}>(), {
  speed: 50,
  barCount: 60,
  barWidth: 4,
  barHeight: 4,
  barGap: 2,
  barRadius: 2,
  fadeEdges: true,
  fadeWidth: 24,
  height: 128,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const bars = ref<Array<{ x: number, height: number }>>([])

let animationId: number | null = null
let lastTime = 0
let resizeObserver: ResizeObserver | null = null
const seed = Math.random()
let dataIndex = 0

function animate(currentTime: number) {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx)
    return

  const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0
  lastTime = currentTime

  const rect = canvas.getBoundingClientRect()
  ctx.clearRect(0, 0, rect.width, rect.height)

  const computedBarColor = props.barColor
    || getComputedStyle(canvas).getPropertyValue('--foreground')
    || '#000'

  const step = props.barWidth + props.barGap

  // Update positions
  for (let i = 0; i < bars.value.length; i++) {
    bars.value[i].x -= props.speed * deltaTime
  }

  // Remove off-screen bars
  bars.value = bars.value.filter(bar => bar.x + props.barWidth > -step)

  // Add new bars
  while (
    bars.value.length === 0
    || bars.value[bars.value.length - 1].x < rect.width
  ) {
    const lastBar = bars.value[bars.value.length - 1]
    const nextX = lastBar ? lastBar.x + step : rect.width

    let newHeight: number
    if (props.data && props.data.length > 0) {
      newHeight = props.data[dataIndex % props.data.length] || 0.1
      dataIndex = (dataIndex + 1) % props.data.length
    }
    else {
      const time = Date.now() / 1000
      const uniqueIndex = bars.value.length + time * 0.01
      const seededRandom = (index: number) => {
        const x = Math.sin(seed * 10000 + index * 137.5) * 10000
        return x - Math.floor(x)
      }
      const wave1 = Math.sin(uniqueIndex * 0.1) * 0.2
      const wave2 = Math.cos(uniqueIndex * 0.05) * 0.15
      const randomComponent = seededRandom(uniqueIndex) * 0.4
      newHeight = Math.max(0.1, Math.min(0.9, 0.3 + wave1 + wave2 + randomComponent))
    }

    bars.value.push({
      x: nextX,
      height: newHeight,
    })
    if (bars.value.length > props.barCount * 2)
      break
  }

  const centerY = rect.height / 2

  // Draw bars
  for (const bar of bars.value) {
    if (bar.x < rect.width && bar.x + props.barWidth > 0) {
      const barHeight = Math.max(props.barHeight, bar.height * rect.height * 0.6)
      const y = centerY - barHeight / 2

      ctx.fillStyle = computedBarColor
      ctx.globalAlpha = 0.3 + bar.height * 0.7

      if (props.barRadius > 0) {
        ctx.beginPath()
        if ('roundRect' in ctx) {
          ctx.roundRect(bar.x, y, props.barWidth, barHeight, props.barRadius)
        }
        else {
          ctx.fillRect(bar.x, y, props.barWidth, barHeight)
        }
        ctx.fill()
      }
      else {
        ctx.fillRect(bar.x, y, props.barWidth, barHeight)
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

      // Initial fill
      if (bars.value.length === 0) {
        const step = props.barWidth + props.barGap
        let currentX = rect.width
        let index = 0
        const seededRandom = (i: number) => {
          const x = Math.sin(seed * 10000 + i) * 10000
          return x - Math.floor(x)
        }
        while (currentX > -step) {
          bars.value.push({
            x: currentX,
            height: 0.2 + seededRandom(index++) * 0.6,
          })
          currentX -= step
        }
      }
    })
    resizeObserver.observe(container)
  }

  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (resizeObserver)
    resizeObserver.disconnect()
  if (animationId)
    cancelAnimationFrame(animationId)
})

// Re-start or reset on some prop changes if needed, but the loop picks up changes generally.
</script>

<template>
  <div
    ref="containerRef"
    :class="cn('relative flex items-center', props.class)"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
  >
    <canvas ref="canvasRef" class="block h-full w-full" />
  </div>
</template>
