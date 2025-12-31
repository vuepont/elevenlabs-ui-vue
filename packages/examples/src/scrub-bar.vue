<script setup lang="ts">
import {
  ScrubBarContainer,
  ScrubBarProgress,
  ScrubBarThumb,
  ScrubBarTimeLabel,
  ScrubBarTrack,
} from '@repo/elements/scrub-bar'
import { ref } from 'vue'

const value = ref(30)
const isScrubbing = ref(false)
const duration = 100

function handleScrub(val: number) {
  value.value = val
}
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-center gap-4 p-4">
    <ScrubBarContainer
      :duration="duration"
      :value="value"
      class="w-full"
      @scrub="handleScrub"
      @scrub-start="isScrubbing = true"
      @scrub-end="isScrubbing = false"
    >
      <ScrubBarTimeLabel :time="value" class="w-10 text-center" />

      <ScrubBarTrack class="mx-2">
        <ScrubBarProgress />
        <ScrubBarThumb
          class="bg-primary"
          :data-scrubbing="isScrubbing"
        />
      </ScrubBarTrack>

      <ScrubBarTimeLabel :time="duration" class="w-10 text-center" />
    </ScrubBarContainer>
  </div>
</template>
