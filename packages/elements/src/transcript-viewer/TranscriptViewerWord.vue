<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { TranscriptWord } from './useTranscriptViewer'
import { cn } from '@repo/shadcn-vue/lib/utils'

type TranscriptViewerWordStatus = 'spoken' | 'unspoken' | 'current'

interface Props {
  word: TranscriptWord
  status: TranscriptViewerWordStatus
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <span
    data-slot="transcript-word"
    data-kind="word"
    :data-status="status"
    :class="cn(
      'rounded-sm px-0.5 transition-colors',
      status === 'spoken' && 'text-foreground',
      status === 'unspoken' && 'text-muted-foreground',
      status === 'current' && 'bg-primary text-primary-foreground',
      props.class,
    )"
  >
    {{ word.text }}
  </span>
</template>
