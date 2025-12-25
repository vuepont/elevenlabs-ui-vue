<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import ScrubBarContainer from '../scrub-bar/ScrubBarContainer.vue'
import ScrubBarProgress from '../scrub-bar/ScrubBarProgress.vue'
import ScrubBarThumb from '../scrub-bar/ScrubBarThumb.vue'
import ScrubBarTimeLabel from '../scrub-bar/ScrubBarTimeLabel.vue'
import ScrubBarTrack from '../scrub-bar/ScrubBarTrack.vue'
import { useTranscriptViewerContext } from './useTranscriptViewer'

interface Props {
  showTimeLabels?: boolean
  labelsClassName?: string
  trackClassName?: string
  progressClassName?: string
  thumbClassName?: string
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
  <ScrubBarContainer
    data-slot="transcript-scrub-bar"
    :duration="duration"
    :value="currentTime"
    :class="props.class"
    @scrub="handleScrub"
    @scrub-start="handleScrubStart"
    @scrub-end="handleScrubEnd"
  >
    <div class="flex flex-1 flex-col gap-1">
      <ScrubBarTrack :class="props.trackClassName">
        <ScrubBarProgress :class="props.progressClassName" />
        <ScrubBarThumb :class="props.thumbClassName" />
      </ScrubBarTrack>
      <div
        v-if="showTimeLabels"
        :class="cn(
          'text-muted-foreground flex items-center justify-between text-xs',
          props.labelsClassName,
        )"
      >
        <ScrubBarTimeLabel :time="currentTime" />
        <ScrubBarTimeLabel :time="Math.max(0, duration - currentTime)" />
      </div>
    </div>
  </ScrubBarContainer>
</template>
