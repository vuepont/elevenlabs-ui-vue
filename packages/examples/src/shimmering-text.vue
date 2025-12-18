<script setup lang="ts">
import { ShimmeringText } from '@repo/elements/shimmering-text'
import { AnimatePresence, Motion } from 'motion-v'
import { onMounted, onUnmounted, ref } from 'vue'

const phrases = [
  'Agent is thinking...',
  'Processing your request...',
  'Analyzing the data...',
  'Generating response...',
  'Almost there...',
]

const currentIndex = ref(0)
let intervalId: ReturnType<typeof setInterval>

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % phrases.length
  }, 3000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div class="bg-card w-full rounded-lg border p-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold">
        Text Shimmer Effect
      </h3>
      <p class="text-muted-foreground text-sm">
        Animated gradient text with automatic cycling
      </p>
    </div>

    <div class="space-y-4">
      <div class="bg-muted/10 flex items-center justify-center rounded-lg py-8">
        <AnimatePresence mode="wait">
          <Motion
            :key="currentIndex"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -10 }"
            :transition="{ duration: 0.3 }"
          >
            <ShimmeringText :text="phrases[currentIndex]" />
          </Motion>
        </AnimatePresence>
      </div>
    </div>
  </div>
</template>
