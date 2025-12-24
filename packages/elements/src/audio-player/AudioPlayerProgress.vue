<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed, ref } from 'vue'
import { useAudioPlayer, useAudioPlayerTime } from './context'

type AudioPlayerProgressProps = InstanceType<typeof SliderRoot>['$props']

interface Props extends /* @vue-ignore */ Omit<AudioPlayerProgressProps, 'value' | 'min' | 'max'> {
  class?: HTMLAttributes['class']
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  step: 0.25,
})

const { step, disabled, class: _, modelValue: __, ...otherProps } = props

const { duration, seek, pause, play, isPlaying } = useAudioPlayer()
const time = useAudioPlayerTime()
const wasPlaying = ref(false)

const maxDuration = computed(() => duration.value ?? 0)
const currentTimeArray = computed(() => [time.value])

const isDisabled = computed(() =>
  duration.value === undefined
  || !Number.isFinite(duration.value)
  || Number.isNaN(duration.value),
)

function handleValueChange(vals?: number[] | null) {
  const next = vals?.[0]
  if (typeof next !== 'number')
    return
  seek(next)
}

function handlePointerDown() {
  wasPlaying.value = isPlaying.value
  pause()
}

function handlePointerUp() {
  if (wasPlaying.value) {
    play()
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === ' ') {
    e.preventDefault()
    if (!isPlaying.value) {
      play()
    }
    else {
      pause()
    }
  }
}
</script>

<template>
  <SliderRoot
    :model-value="currentTimeArray"
    :min="0"
    :max="maxDuration"
    :step="step"
    :disabled="isDisabled"
    v-bind="otherProps"
    :class="cn(
      'group/player relative flex h-4 touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
      props.class,
    )"
    @update:model-value="handleValueChange"
    @value-commit="handleValueChange"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @keydown="handleKeyDown"
  >
    <SliderTrack class="bg-muted relative h-1 w-full grow overflow-hidden rounded-full">
      <SliderRange class="bg-primary absolute h-full" />
    </SliderTrack>
    <SliderThumb
      class="relative flex h-0 w-0 items-center justify-center opacity-0 group-hover/player:opacity-100 focus-visible:opacity-100 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
    >
      <div class="bg-foreground absolute size-3 rounded-full" />
    </SliderThumb>
  </SliderRoot>
</template>
