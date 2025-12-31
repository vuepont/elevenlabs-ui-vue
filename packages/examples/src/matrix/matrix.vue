<script setup lang="ts">
import type { Frame } from '@repo/elements/matrix'
import { Matrix } from '@repo/elements/matrix'
import { onUnmounted, ref, watch } from 'vue'
import {
  burst,
  corners,
  createCollapseEffect,
  createExpandedLogo,
  createUnifiedPattern,
  elevenLogo,
  expand,
  pulse,
  sandTimer,
  snake,
  spinner,
  sweep,
  wave,
} from './patterns'

type Mode = 'individual' | 'focus' | 'expand' | 'unified' | 'collapse' | 'burst'

const mode = ref<Mode>('individual')
const unifiedFrame = ref(0)
const expandProgress = ref(0)
const collapseProgress = ref(0)

const configurations = [
  { animation: pulse, fps: 16 },
  { animation: wave, fps: 20 },
  { animation: spinner, fps: 10 },
  { animation: snake, fps: 15 },
  { animation: elevenLogo, fps: 12 },
  { animation: sandTimer, fps: 12 },
  { animation: corners, fps: 10 },
  { animation: sweep, fps: 14 },
  { animation: expand, fps: 12 },
]

let modeTimeout: ReturnType<typeof setTimeout>
watch(mode, (newMode) => {
  clearTimeout(modeTimeout)

  const sequence: Record<Mode, { next: Mode, time: number }> = {
    individual: { next: 'focus', time: 4000 },
    focus: { next: 'expand', time: 2000 },
    expand: { next: 'unified', time: 2500 },
    unified: { next: 'collapse', time: 4000 },
    collapse: { next: 'burst', time: 2500 },
    burst: { next: 'individual', time: 800 },
  }

  const current = sequence[newMode]
  modeTimeout = setTimeout(() => {
    mode.value = current.next
  }, current.time)
}, { immediate: true })

let unifiedInterval: ReturnType<typeof setInterval>
watch(mode, (newMode) => {
  clearInterval(unifiedInterval)
  if (newMode === 'unified') {
    unifiedInterval = setInterval(() => {
      unifiedFrame.value += 1
    }, 50)
  }
})

function startProgressAnimation(targetRef: typeof expandProgress, activeMode: Mode) {
  let start = 0
  let rafId: number

  const animate = (timestamp: number) => {
    if (mode.value !== activeMode)
      return
    if (start === 0)
      start = timestamp

    const elapsed = timestamp - start
    const progress = Math.min(elapsed / 2500, 1)
    targetRef.value = progress

    if (progress < 1) {
      rafId = requestAnimationFrame(animate)
    }
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

let cleanupExpand: (() => void) | undefined
let cleanupCollapse: (() => void) | undefined

watch(mode, (newMode) => {
  if (cleanupExpand)
    cleanupExpand()
  if (cleanupCollapse)
    cleanupCollapse()

  if (newMode === 'expand') {
    cleanupExpand = startProgressAnimation(expandProgress, 'expand')
  }
  else {
    expandProgress.value = 0
  }

  if (newMode === 'collapse') {
    cleanupCollapse = startProgressAnimation(collapseProgress, 'collapse')
  }
  else {
    collapseProgress.value = 0
  }
})

function getPatternForMatrix(index: number): Frame | undefined {
  if (mode.value === 'individual')
    return undefined

  if (mode.value === 'focus') {
    if (index === 4) {
      const frame = Array.from({ length: 7 }, () => Array.from({ length: 7 }).fill(0))
      for (let r = 1; r <= 5; r++) {
        frame[r][2] = 1
        frame[r][4] = 1
      }
      return frame as Frame
    }
    return Array.from({ length: 7 }, () => Array.from({ length: 7 }).fill(0)) as Frame
  }

  if (mode.value === 'expand')
    return createExpandedLogo(expandProgress.value)[index]
  if (mode.value === 'unified')
    return createUnifiedPattern(unifiedFrame.value)[index]
  if (mode.value === 'collapse')
    return createCollapseEffect(collapseProgress.value)[index]
  if (mode.value === 'burst')
    return undefined
}

function getFramesForMatrix(index: number) {
  if (mode.value === 'individual')
    return configurations[index].animation
  if (mode.value === 'burst')
    return burst
  return undefined
}

function getFps(index: number) {
  return mode.value === 'burst' ? 30 : configurations[index].fps
}

onUnmounted(() => {
  clearTimeout(modeTimeout)
  clearInterval(unifiedInterval)
  if (cleanupExpand)
    cleanupExpand()
  if (cleanupCollapse)
    cleanupCollapse()
})
</script>

<template>
  <div class="flex min-h-[600px] w-full flex-col items-center justify-center p-8">
    <div
      class="grid gap-1.5 transition-all duration-1000"
      :style="{
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
      }"
    >
      <div
        v-for="(config, index) in configurations"
        :key="index"
        class="flex items-center justify-center transition-all duration-1000"
      >
        <Matrix
          :rows="7"
          :cols="7"
          :frames="getFramesForMatrix(index)"
          :pattern="getPatternForMatrix(index)"
          :fps="getFps(index)"
          :size="10"
          :gap="2"
          :aria-label="`Matrix ${index + 1}`"
        />
      </div>
    </div>
  </div>
</template>
