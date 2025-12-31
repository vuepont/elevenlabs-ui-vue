<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { PauseIcon, PlayIcon } from 'lucide-vue-next'
import { useTranscriptViewerContext } from './useTranscriptViewer'

type PlayerButtonProps = InstanceType<typeof Button>['$props']

interface Props extends /* @vue-ignore */ Omit<PlayerButtonProps, 'children'> {
  class?: HTMLAttributes['class']
  disabled?: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', payload: MouseEvent): void
}>()

const { isPlaying, play, pause } = useTranscriptViewerContext()

function handleClick(e: MouseEvent) {
  if (isPlaying.value)
    pause()
  else play()
  emit('click', e)
}
</script>

<template>
  <Button
    data-slot="transcript-play-pause-button"
    type="button"
    variant="outline"
    :size="props.size || 'icon'"
    :aria-label="isPlaying ? 'Pause audio' : 'Play audio'"
    :data-playing="isPlaying"
    :disabled="props.disabled"
    :class="cn('cursor-pointer', props.class)"
    @click="handleClick"
  >
    <slot :is-playing="isPlaying">
      <PauseIcon v-if="isPlaying" class="size-5" />
      <PlayIcon v-else class="size-5" />
    </slot>
  </Button>
</template>
