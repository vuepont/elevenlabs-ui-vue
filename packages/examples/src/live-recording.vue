<script setup lang="ts">
import { ScrollingWaveform } from '@repo/elements/waveform'
import { Card, CardContent } from '@repo/shadcn-vue/components/ui/card'
import { onMounted, onUnmounted, ref } from 'vue'

const remountKey = ref(0)

function handleResize() {
  remountKey.value += 1
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <Card class="hidden w-full p-0 sm:flex">
    <CardContent class="m-0! flex w-full flex-col p-1!">
      <div class="flex flex-col justify-center">
        <div class="bg-background relative overflow-hidden rounded-t-lg bg-linear-to-r transition-opacity duration-1000 ease-out">
          <ScrollingWaveform
            :key="remountKey"
            height="h-full"
            :bar-width="4"
            :bar-gap="2"
            :speed="50"
            :fade-edges="true"
            :bar-count="25"
            class="opacity-90"
          />
        </div>
        <div class="flex items-center justify-between p-3">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span class="text-muted-foreground text-xs">Live</span>
          </div>
          <span class="text-muted-foreground text-xs">128 kbps</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
