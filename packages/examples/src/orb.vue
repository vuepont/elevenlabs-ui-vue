<script setup lang="ts">
import type { AgentState } from '@repo/elements/orb'
import { Orb } from '@repo/elements/orb'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { computed, ref } from 'vue'

const props = defineProps<{
  small?: boolean
}>()

const agent = ref<AgentState>(null)

const allOrbs: [string, string][] = [
  ['#CADCFC', '#A0B9D1'],
  ['#F6E7D8', '#E0CFC2'],
  ['#E5E7EB', '#9CA3AF'],
]

const orbs = computed(() => (props.small ? [allOrbs[0]] : allOrbs))
</script>

<template>
  <div class="bg-card w-full rounded-lg border p-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold">
        Agent Orbs
      </h3>
      <p class="text-muted-foreground text-sm">
        Interactive orb visualization with agent states
      </p>
    </div>

    <div class="space-y-4">
      <div class="flex justify-center gap-8">
        <div
          v-for="(colors, index) in orbs"
          :key="index"
          class="relative"
          :class="index === 1 ? 'block md:block' : 'hidden md:block'"
        >
          <div class="bg-muted relative h-32 w-32 rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <div class="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
              <Orb
                :colors="colors"
                :seed="(index + 1) * 1000"
                :agent-state="agent"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        <Button
          size="sm"
          variant="outline"
          :disabled="agent === null"
          @click="agent = null"
        >
          Idle
        </Button>
        <Button
          size="sm"
          variant="outline"
          :disabled="agent === 'listening'"
          @click="agent = 'listening'"
        >
          Listening
        </Button>
        <Button
          size="sm"
          variant="outline"
          :disabled="agent === 'talking'"
          @click="agent = 'talking'"
        >
          Talking
        </Button>
      </div>
    </div>
  </div>
</template>
