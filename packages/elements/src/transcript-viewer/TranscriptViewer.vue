<script setup lang="ts">
import type { CharacterAlignmentResponseModel } from '@elevenlabs/elevenlabs-js/api/types/CharacterAlignmentResponseModel'
import type { HTMLAttributes } from 'vue'
import type {
  SegmentComposer,
  TranscriptViewerAudioProps,
  TranscriptViewerAudioType,
  TranscriptViewerContextValue,
} from './useTranscriptViewer'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { reactive, toRef, watch } from 'vue'
import { provideTranscriptViewerContext, useTranscriptViewer } from './useTranscriptViewer'

interface Props {
  audioSrc: string
  audioType?: TranscriptViewerAudioType
  alignment: CharacterAlignmentResponseModel
  segmentComposer?: SegmentComposer
  hideAudioTags?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  audioType: 'audio/mpeg' as TranscriptViewerAudioType,
  hideAudioTags: true,
})

const emit = defineEmits<{
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'timeUpdate', time: number): void
  (e: 'ended'): void
  (e: 'durationChange', duration: number): void
}>()

const alignmentRef = toRef(props, 'alignment')

const viewerState = useTranscriptViewer({
  alignment: alignmentRef,
  hideAudioTags: props.hideAudioTags,
  segmentComposer: props.segmentComposer,
  onPlay: () => emit('play'),
  onPause: () => emit('pause'),
  onTimeUpdate: time => emit('timeUpdate', time),
  onEnded: () => emit('ended'),
  onDurationChange: duration => emit('durationChange', duration),
})

const audioProps = reactive<TranscriptViewerAudioProps>({
  controls: false,
  preload: 'metadata',
  src: props.audioSrc,
  type: props.audioType,
})

watch(
  () => [props.audioSrc, props.audioType] as const,
  ([src, type]) => {
    audioProps.src = src
    audioProps.type = type
  },
  { immediate: true },
)

const contextValue: TranscriptViewerContextValue = {
  ...viewerState,
  audioProps,
}

provideTranscriptViewerContext(contextValue)
</script>

<template>
  <div
    data-slot="transcript-viewer-root"
    :class="cn('space-y-4 p-4', props.class)"
  >
    <slot />
  </div>
</template>
