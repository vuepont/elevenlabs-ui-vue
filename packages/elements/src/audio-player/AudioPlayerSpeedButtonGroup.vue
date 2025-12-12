<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { computed } from 'vue'
import { useAudioPlayer } from './useAudioPlayer'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  speeds?: readonly number[]
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  speeds: () => [0.5, 1, 1.5, 2],
})

const player = useAudioPlayer()
const currentSpeed = computed(() => player.playbackRate.value)
</script>

<template>
  <div
    v-bind="props"
    :class="cn('flex items-center gap-1', props.class)"
    role="group"
    aria-label="Playback speed controls"
  >
    <Button
      v-for="speed in speeds"
      :key="speed"
      :variant="currentSpeed === speed ? 'default' : 'outline'"
      size="sm"
      class="min-w-[50px] font-mono text-xs"
      @click="player.setPlaybackRate(speed)"
    >
      {{ speed }}x
    </Button>
  </div>
</template>
