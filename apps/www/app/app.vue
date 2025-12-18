<script lang="ts" setup>
import { AudioPlayer, BarVisualizer, ScrubBar, ShimmeringText } from '@repo/examples'
</script>

<template>
  <div class="flex flex-col gap-6 w-1/2 mx-auto mt-20">
    <AudioPlayer />
    <BarVisualizer />
    <ShimmeringText />
    <ScrubBar />
  </div>
</template>
