<script setup lang="ts">
import type { AgentState } from '@repo/elements/bar-visualizer'
import { BarVisualizer } from '@repo/elements/bar-visualizer'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/shadcn-vue/components/ui/card'
import { ref } from 'vue'

const state = ref<AgentState>('listening')

const states: AgentState[] = [
  'connecting',
  'initializing',
  'listening',
  'speaking',
  'thinking',
]

// Helper function to capitalize first letter for display
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Audio Frequency Visualizer</CardTitle>
      <CardDescription>
        Real-time frequency band visualization with animated state transitions
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <BarVisualizer
          :state="state"
          :demo="true"
          :bar-count="20"
          :min-height="15"
          :max-height="90"
          class="h-40 max-w-full"
        />

        <div class="flex flex-wrap gap-2">
          <Button
            v-for="s in states"
            :key="s"
            size="sm"
            :variant="state === s ? 'default' : 'outline'"
            @click="state = s"
          >
            {{ capitalize(s || '') }}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
