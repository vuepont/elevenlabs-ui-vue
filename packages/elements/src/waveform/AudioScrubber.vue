<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Waveform from './Waveform.vue'

const props = withDefaults(defineProps<{
  data?: number[]
  currentTime?: number
  duration?: number
  showHandle?: boolean
  barWidth?: number
  barHeight?: number
  barGap?: number
  barRadius?: number
  barColor?: string
  height?: string | number
  class?: HTMLAttributes['class']
}>(), {
  data: () => [],
  currentTime: 0,
  duration: 100,
  showHandle: true,
  barWidth: 3,
  barGap: 1,
  barRadius: 1,
  height: 128,
})

const emit = defineEmits<{
  seek: [time: number]
}>()

const isDragging = ref(false)
const localProgress = ref(0)
const containerRef = ref<HTMLDivElement | null>(null)

const waveformData = computed(() => {
  return props.data.length > 0
    ? props.data
    : Array.from({ length: 100 }, () => 0.2 + Math.random() * 0.6)
})

watch(() => [props.currentTime, props.duration], () => {
  if (!isDragging.value && props.duration > 0) {
    localProgress.value = props.currentTime / props.duration
  }
}, { immediate: true })

function handleScrub(clientX: number) {
  const container = containerRef.value
  if (!container)
    return

  const rect = container.getBoundingClientRect()
  const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
  const progress = x / rect.width
  const newTime = progress * props.duration

  localProgress.value = progress
  emit('seek', newTime)
}

function handleMouseDown(e: MouseEvent) {
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
  if (isDragging.value) {
    isDragging.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div
    ref="containerRef"
    role="slider"
    aria-label="Audio waveform scrubber"
    :aria-valuemax="duration"
    aria-valuemin="0"
    :aria-valuenow="currentTime"
    tabindex="0"
    :class="cn('relative cursor-pointer select-none', props.class)"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
    @mousedown="handleMouseDown"
  >
    <Waveform
      :bar-color="barColor"
      :bar-gap="barGap"
      :bar-radius="barRadius"
      :bar-width="barWidth"
      :bar-height="barHeight"
      :data="waveformData"
      :fade-edges="false"
      class="h-full w-full"
    />

    <div
      class="bg-primary/20 pointer-events-none absolute inset-y-0 left-0"
      :style="{ width: `${localProgress * 100}%` }"
    />

    <div
      class="bg-primary pointer-events-none absolute bottom-0 top-0 w-0.5"
      :style="{ left: `${localProgress * 100}%` }"
    />

    <div
      v-if="showHandle"
      class="border-background bg-primary pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-lg transition-transform hover:scale-110"
      :style="{ left: `${localProgress * 100}%` }"
    />
  </div>
</template>
