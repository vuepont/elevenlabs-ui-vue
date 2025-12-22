<script setup lang="ts">
import {
  AudioPlayer,
  BarVisualizer,
  ConversationBar,
  LiveWaveform,
  ScrubBar,
  ShimmeringText,
} from '@repo/examples'
</script>

<template>
  <div class="theme-container mx-auto grid gap-8 py-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6 2xl:gap-8">
    <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full">
      <BarVisualizer />
    </div>
    <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full">
      <ShimmeringText />
      <ScrubBar />
      <ConversationBar />
    </div>
    <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full">
      <AudioPlayer />
    </div>
    <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full">
      <LiveWaveform />
    </div>
  </div>
</template>
