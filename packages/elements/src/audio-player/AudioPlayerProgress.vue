<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed, ref } from 'vue'
import { useAudioPlayer } from './useAudioPlayer'

type AudioPlayerProgressProps = InstanceType<typeof SliderRoot>['$props']

interface Props extends /* @vue-ignore */ Omit<AudioPlayerProgressProps, 'value' | 'min' | 'max'> {
  class?: HTMLAttributes['class']
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  step: 0.25,
})

const { step, disabled, class: _, modelValue: __, ...otherProps } = props

const player = useAudioPlayer()
const wasPlaying = ref(false)

const maxDuration = computed(() => player.duration.value ?? 0)
const currentTimeArray = computed({
  get: () => [player.currentTime.value],
  set: () => {
    // Only used by Slider internal, real logic is in onValueChange
  },
})

const isDisabled = computed(() =>
  player.duration.value === undefined
  || !Number.isFinite(player.duration.value)
  || Number.isNaN(player.duration.value),
)

function handleValueChange(vals: number[]) {
  player.seek(vals[0])
}

function handlePointerDown() {
  wasPlaying.value = player.isPlaying.value
  player.pause()
}

function handlePointerUp() {
  if (wasPlaying.value) {
    player.play()
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === ' ') {
    e.preventDefault()
    if (!player.isPlaying.value) {
      player.play()
    }
    else {
      player.pause()
    }
  }
}
</script>

<template>
  <SliderRoot
    v-model="currentTimeArray"
    :min="0"
    :max="maxDuration"
    :step="step"
    :disabled="isDisabled"
    v-bind="otherProps"
    :class="cn(
      'group/player relative flex h-4 touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
      props.class,
    )"
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
