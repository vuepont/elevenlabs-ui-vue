<script lang="ts" setup>
import { AudioPlayer, BarVisualizer, ConversationBar, LiveWaveform, Matrix, MicSelector, Response, ScrubBar, ShimmeringText, VoiceButton } from '@repo/examples'
</script>

<template>
  <div class="flex flex-col gap-6 w-1/2 mx-auto my-20">
    <AudioPlayer />
    <BarVisualizer />
    <ShimmeringText />
    <ScrubBar />
    <Response />
    <LiveWaveform />
    <MicSelector />
    <VoiceButton />
    <ConversationBar />
    <Matrix />
  </div>
</template>
