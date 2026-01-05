<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { Frame, MatrixMode } from './types'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { computed, toRefs } from 'vue'
import { clamp, ensureFrameSize, vu } from './types'
import { useAnimation } from './useAnimation'

interface Props {
  rows: number
  cols: number
  pattern?: Frame
  frames?: Frame[]
  fps?: number
  autoplay?: boolean
  loop?: boolean
  size?: number
  gap?: number
  palette?: { on: string, off: string }
  brightness?: number
  ariaLabel?: string
  mode?: MatrixMode
  levels?: number[]
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  fps: 12,
  autoplay: true,
  loop: true,
  size: 10,
  gap: 2,
  palette: () => ({
    on: 'currentColor',
    off: 'var(--muted-foreground)',
  }),
  brightness: 1,
  mode: 'default',
})

const emit = defineEmits<{
  (e: 'frame', index: number): void
}>()

const { frames, pattern, levels } = toRefs(props)

const { frameIndex } = useAnimation(frames, {
  fps: props.fps,
  autoplay: props.autoplay && !props.pattern,
  loop: props.loop,
  onFrame: idx => emit('frame', idx),
})

const currentFrame = computed(() => {
  if (props.mode === 'vu' && levels?.value && levels.value.length > 0) {
    return ensureFrameSize(vu(props.cols, levels.value), props.rows, props.cols)
  }
  if (pattern?.value) {
    return ensureFrameSize(pattern.value, props.rows, props.cols)
  }
  if (frames?.value && frames.value.length > 0) {
    const idx = frames.value[frameIndex.value] ? frameIndex.value : 0
    return ensureFrameSize(frames.value[idx], props.rows, props.cols)
  }
  return ensureFrameSize([], props.rows, props.cols)
})

const svgDimensions = computed(() => ({
  width: props.cols * (props.size + props.gap) - props.gap,
  height: props.rows * (props.size + props.gap) - props.gap,
}))

const isAnimating = computed(() => !props.pattern && props.frames && props.frames.length > 0)

function getPixelAttributes(value: number, rowIndex: number, colIndex: number) {
  const opacity = clamp(props.brightness * value)
  const isActive = opacity > 0.5
  const isOn = opacity > 0.05

  return {
    // key: `${rowIndex}-${colIndex}`,
    class: cn('matrix-pixel', { 'matrix-pixel-active': isActive }),
    cx: colIndex * (props.size + props.gap) + props.size / 2,
    cy: rowIndex * (props.size + props.gap) + props.size / 2,
    r: (props.size / 2) * 0.9,
    fill: isOn ? 'url(#matrix-pixel-on)' : 'url(#matrix-pixel-off)',
    opacity: isOn ? opacity : 0.1,
    style: {
      transform: `scale(${isActive ? 1.1 : 1})`,
    },
  }
}
</script>

<template>
  <div
    role="img"
    :aria-label="ariaLabel ?? 'matrix display'"
    :aria-live="isAnimating ? 'polite' : undefined"
    :class="cn('relative inline-block', props.class)"
    :style="{
      '--matrix-on': palette.on,
      '--matrix-off': palette.off,
    }"
  >
    <svg
      :width="svgDimensions.width"
      :height="svgDimensions.height"
      :viewBox="`0 0 ${svgDimensions.width} ${svgDimensions.height}`"
      xmlns="http://www.w3.org/2000/svg"
      class="block overflow-visible"
    >
      <defs>
        <radialGradient id="matrix-pixel-on" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="var(--matrix-on)" stop-opacity="1" />
          <stop offset="70%" stop-color="var(--matrix-on)" stop-opacity="0.85" />
          <stop offset="100%" stop-color="var(--matrix-on)" stop-opacity="0.6" />
        </radialGradient>

        <radialGradient id="matrix-pixel-off" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="var(--matrix-off)" stop-opacity="1" />
          <stop offset="100%" stop-color="var(--matrix-off)" stop-opacity="0.7" />
        </radialGradient>

        <filter id="matrix-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g v-for="(row, rowIndex) in currentFrame" :key="rowIndex">
        <circle
          v-for="(value, colIndex) in row"
          :key="colIndex"
          v-bind="getPixelAttributes(value, rowIndex, colIndex)"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.matrix-pixel {
  transition: opacity 300ms ease-out, transform 150ms ease-out;
  transform-origin: center;
  transform-box: fill-box;
}

.matrix-pixel-active {
  filter: url(#matrix-glow);
}
</style>
