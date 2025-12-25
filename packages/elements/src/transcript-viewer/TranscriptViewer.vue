<script setup lang="ts">
import type { CharacterAlignmentResponseModel } from '@elevenlabs/elevenlabs-js/api/types/CharacterAlignmentResponseModel'
import type { HTMLAttributes } from 'vue'
import type { SegmentComposer, TranscriptViewerAudioProps, TranscriptViewerAudioType, TranscriptViewerContextValue } from './useTranscriptViewer'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { reactive, toRef, watch } from 'vue'
import {
  provideTranscriptViewerContext,

  useTranscriptViewer,
} from './useTranscriptViewer'

interface Props {
  audioSrc: string
  audioType?: TranscriptViewerAudioType
  alignment: CharacterAlignmentResponseModel
  segmentComposer?: SegmentComposer
  hideAudioTags?: boolean
  class?: HTMLAttributes['class']
  onPlay?: () => void
  onPause?: () => void
  onTimeUpdate?: (time: number) => void
  onEnded?: () => void
  onDurationChange?: (duration: number) => void
}

const props = withDefaults(defineProps<Props>(), {
  audioType: 'audio/mpeg' as TranscriptViewerAudioType,
  hideAudioTags: true,
})

const alignmentRef = toRef(props, 'alignment')

const viewerState = useTranscriptViewer({
  alignment: alignmentRef,
  hideAudioTags: props.hideAudioTags,
  segmentComposer: props.segmentComposer,
  onPlay: props.onPlay,
  onPause: props.onPause,
  onTimeUpdate: props.onTimeUpdate,
  onEnded: props.onEnded,
  onDurationChange: props.onDurationChange,
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
