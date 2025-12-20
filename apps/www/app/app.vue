<script lang="ts" setup>
import { AudioPlayer, BarVisualizer, ConversationBar, LiveWaveform, Matrix, MicSelector, ScrubBar, ShimmeringText } from '@repo/examples'
</script>

<template>
  <div class="flex flex-col gap-6 w-1/2 mx-auto my-20">
    <AudioPlayer />
    <BarVisualizer />
    <ShimmeringText />
    <ScrubBar />
    <LiveWaveform />
    <MicSelector />
    <ConversationBar />
    <Matrix />
  </div>
</template>
