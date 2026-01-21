<script setup lang="ts">
import type { AgentState } from '@repo/elements/bar-visualizer'
import { BarVisualizer } from '@repo/elements/bar-visualizer'
import { ShimmeringText } from '@repo/elements/shimmering-text'
import { Card, CardContent } from '@repo/shadcn-vue/components/ui/card'
import { AnimatePresence, Motion } from 'motion-v'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const states: AgentState[] = [
  'connecting',
  'initializing',
  'listening',
  'thinking',
  'speaking',
]

const currentIndex = ref(0)
const currentState = computed(() => states[currentIndex.value] ?? 'listening')
let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % states.length
  }, 2500)
})

onUnmounted(() => {
  if (intervalId)
    clearInterval(intervalId)
})
</script>

<template>
  <Card class="overflow-hidden p-0">
    <CardContent class="flex flex-col p-1">
      <div class="bg-background relative h-40 overflow-hidden rounded-t-lg">
        <BarVisualizer
          :state="currentState"
          :demo="true"
          :bar-count="12"
          :min-height="20"
          :max-height="80"
          :center-align="false"
          class="h-full w-full bg-transparent p-3"
        />
      </div>
      <div class="flex items-center justify-center py-3">
        <AnimatePresence mode="wait">
          <Motion
            :key="currentIndex"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -10 }"
            :transition="{ duration: 0.3 }"
          >
            <ShimmeringText :text="currentState" class="text-sm capitalize" />
          </Motion>
        </AnimatePresence>
      </div>
    </CardContent>
  </Card>
</template>
