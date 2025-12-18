<script setup lang="ts">
import { LiveWaveform } from '@repo/elements/live-waveform'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { ref } from 'vue'

const active = ref(false)
const processing = ref(false)
const mode = ref<'static' | 'scrolling'>('static')

function handleToggleActive() {
  active.value = !active.value
  // If starting to listen, stop processing
  if (active.value) {
    processing.value = false
  }
}

function handleToggleProcessing() {
  processing.value = !processing.value
  // If starting processing, stop listening
  if (processing.value) {
    active.value = false
  }
}

function toggleMode() {
  mode.value = mode.value === 'static' ? 'scrolling' : 'static'
}
</script>

<template>
  <div class="bg-card w-full rounded-lg border p-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold">
        Live Audio Waveform
      </h3>
      <p class="text-muted-foreground text-sm">
        Real-time microphone input visualization with audio reactivity
      </p>
    </div>

    <div class="space-y-4">
      <LiveWaveform
        :active="active"
        :processing="processing"
        :height="80"
        :bar-width="3"
        :bar-gap="2"
        :mode="mode"
        :fade-edges="true"
        bar-color="gray"
        :history-size="120"
      />

      <div class="flex flex-wrap justify-center gap-2">
        <Button
          size="sm"
          :variant="active ? 'default' : 'outline'"
          @click="handleToggleActive"
        >
          {{ active ? "Stop" : "Start" }} Listening
        </Button>

        <Button
          size="sm"
          :variant="processing ? 'default' : 'outline'"
          @click="handleToggleProcessing"
        >
          {{ processing ? "Stop" : "Start" }} Processing
        </Button>

        <Button
          size="sm"
          variant="outline"
          @click="toggleMode"
        >
          Mode: {{ mode === "static" ? "Static" : "Scrolling" }}
        </Button>
      </div>
    </div>
  </div>
</template>
