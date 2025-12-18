<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { computed, ref } from 'vue'
import { useScrubBar } from './useScrubBar'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const trackRef = ref<HTMLDivElement | null>(null)
const { duration, value, onScrub, onScrubStart, onScrubEnd } = useScrubBar()

// Computed clamped value for ARIA attributes
const clampedValue = computed(() =>
  Math.min(Math.max(value.value, 0), duration.value || 0),
)

function getTimeFromClientX(clientX: number) {
  const track = trackRef.value
  if (!track || !duration.value)
    return null
  const rect = track.getBoundingClientRect()
  const ratio = (clientX - rect.left) / rect.width
  const clamped = Math.min(Math.max(ratio, 0), 1)
  return duration.value * clamped
}

function handlePointerDown(event: PointerEvent) {
  if (!duration.value)
    return
  event.preventDefault()

  onScrubStart?.()

  const time = getTimeFromClientX(event.clientX)
  if (time != null) {
    onScrub?.(time)
  }

  const handleMove = (moveEvent: PointerEvent) => {
    const nextTime = getTimeFromClientX(moveEvent.clientX)
    if (nextTime != null) {
      onScrub?.(nextTime)
    }
  }

  const handleUp = () => {
    onScrubEnd?.()
    window.removeEventListener('pointermove', handleMove)
    window.removeEventListener('pointerup', handleUp)
  }

  window.addEventListener('pointermove', handleMove)
  window.addEventListener('pointerup', handleUp, { once: true })
}
</script>

<template>
  <div
    ref="trackRef"
    data-slot="scrub-bar-track"
    :class="cn(
      'bg-secondary relative h-2 w-full grow cursor-pointer touch-none rounded-full transition-none select-none',
      props.class,
    )"
    role="slider"
    :aria-valuemin="0"
    :aria-valuemax="duration || 0"
    :aria-valuenow="clampedValue"
    @pointerdown="handlePointerDown"
  >
    <slot />
  </div>
</template>
