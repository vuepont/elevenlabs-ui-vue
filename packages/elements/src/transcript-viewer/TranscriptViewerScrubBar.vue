<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import {
  ScrubBar,
  ScrubBarProgress,
  ScrubBarThumb,
  ScrubBarTimeLabel,
  ScrubBarTrack,
} from '../scrub-bar'
import { useTranscriptViewerContext } from './useTranscriptViewer'

interface Props {
  showTimeLabels?: boolean
  labelsClass?: string
  trackClass?: string
  progressClass?: string
  thumbClass?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  showTimeLabels: true,
})

const {
  duration,
  currentTime,
  seekToTime,
  startScrubbing,
  endScrubbing,
} = useTranscriptViewerContext()

function handleScrub(time: number) {
  seekToTime(time)
}

function handleScrubStart() {
  startScrubbing()
}

function handleScrubEnd() {
  endScrubbing()
}
</script>

<template>
  <ScrubBar
    data-slot="transcript-scrub-bar"
    :duration="duration"
    :value="currentTime"
    :class="props.class"
    @scrub="handleScrub"
    @scrub-start="handleScrubStart"
    @scrub-end="handleScrubEnd"
  >
    <div class="flex flex-1 flex-col gap-1">
      <ScrubBarTrack :class="props.trackClass">
        <ScrubBarProgress :class="props.progressClass" />
        <ScrubBarThumb :class="props.thumbClass" />
      </ScrubBarTrack>
      <div
        v-if="showTimeLabels"
        :class="cn(
          'text-muted-foreground flex items-center justify-between text-xs',
          props.labelsClass,
        )"
      >
        <ScrubBarTimeLabel :time="currentTime" />
        <ScrubBarTimeLabel :time="Math.max(0, duration - currentTime)" />
      </div>
    </div>
  </ScrubBar>
</template>
