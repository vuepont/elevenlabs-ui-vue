<script setup lang="ts">
import { ScrollingWaveform } from '@repo/elements/waveform'
</script>

<template>
  <div class="bg-card w-full rounded-lg border p-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold">
        Waveform
      </h3>
      <p class="text-muted-foreground text-sm">
        Real-time audio visualization with smooth scrolling animation
      </p>
    </div>
    <ScrollingWaveform
      :height="80"
      :bar-width="3"
      :bar-gap="2"
      :speed="30"
      :fade-edges="true"
      bar-color="gray"
    />
  </div>
</template>
