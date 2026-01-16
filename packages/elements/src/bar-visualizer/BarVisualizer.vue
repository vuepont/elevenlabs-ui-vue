<!-- eslint-disable unicorn/no-new-array -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { AgentState } from './useAudioVisualizer'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { useRafFn } from '@vueuse/core'
import { computed, ref, toRef, watch } from 'vue'
import Bar from './Bar.vue'
import { useBarAnimator, useMultibandVolume } from './useAudioVisualizer'

export interface BarVisualizerProps extends /* @vue-ignore */ HTMLAttributes {
  /** Voice assistant state */
  state?: AgentState
  /** Number of bars to display */
  barCount?: number
  /** Audio source */
  mediaStream?: MediaStream | null
  /** Min/max height as percentage */
  minHeight?: number
  maxHeight?: number
  /** Enable demo mode with fake audio data */
  demo?: boolean
  centerAlign?: boolean
  /** Align bars from center instead of bottom */
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<BarVisualizerProps>(), {
  barCount: 15,
  minHeight: 20,
  maxHeight: 100,
  demo: false,
  centerAlign: false,
})

const mediaStreamRef = toRef(props, 'mediaStream')
const realVolumeBands = useMultibandVolume(mediaStreamRef, {
  bands: props.barCount,
  loPass: 100,
  hiPass: 200,
})

const fakeVolumeBands = ref<number[]>(new Array(props.barCount).fill(0.2))

let lastFakeUpdate = 0
const fakeUpdateInterval = 50
let startTime = Date.now() / 1000 // Global start time for the sine wave

// Watch state changes to reset the sine wave phase
watch(() => props.state, () => {
  startTime = Date.now() / 1000
})

const { pause: pauseFake, resume: resumeFake } = useRafFn(({ timestamp }) => {
  if (!props.demo)
    return
  // Only animate fake volume in these states
  if (props.state !== 'speaking' && props.state !== 'listening')
    return

  if (timestamp - lastFakeUpdate >= fakeUpdateInterval) {
    const time = Date.now() / 1000 - startTime // Use local relative time
    const newBands = new Array(props.barCount)

    for (let i = 0; i < props.barCount; i++) {
      const waveOffset = i * 0.5
      // The wave calculation depends on 'time' starting from 0 on state change
      const baseVolume = Math.sin(time * 2 + waveOffset) * 0.3 + 0.5
      const randomNoise = Math.random() * 0.2
      newBands[i] = Math.max(0.1, Math.min(1, baseVolume + randomNoise))
    }

    fakeVolumeBands.value = newBands
    lastFakeUpdate = timestamp
  }
}, { immediate: false })

// Toggle the loop based on state
watch(
  () => [props.demo, props.state],
  () => {
    const shouldRun = props.demo && (props.state === 'speaking' || props.state === 'listening')

    if (shouldRun) {
      resumeFake()
    }
    else {
      pauseFake()
      // Reset to idle flat line when not animating
      if (props.demo) {
        fakeVolumeBands.value = new Array(props.barCount).fill(0.2)
      }
    }
  },
  { immediate: true },
)

// Merge Data Sources
const volumeBands = computed(() =>
  props.demo ? fakeVolumeBands.value : realVolumeBands.value,
)

// Animation Sequencing
const animationInterval = computed(() => {
  if (props.state === 'connecting')
    return 2000 / props.barCount
  if (props.state === 'thinking')
    return 150
  if (props.state === 'listening')
    return 500
  return 1000
})

const stateRef = toRef(props, 'state')
const highlightedIndices = useBarAnimator(
  stateRef,
  props.barCount,
  animationInterval, // Pass the Ref directly
)
</script>

<template>
  <div
    :data-state="state"
    :class="cn(
      'relative flex justify-center gap-1.5',
      centerAlign ? 'items-center' : 'items-end',
      'bg-muted h-32 w-full overflow-hidden rounded-lg p-4',
      props.class,
    )"
  >
    <Bar
      v-for="(volume, index) in volumeBands"
      :key="index"
      :height-pct="Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5))"
      :is-highlighted="highlightedIndices.includes(index)"
      :state="state"
    />
  </div>
</template>
