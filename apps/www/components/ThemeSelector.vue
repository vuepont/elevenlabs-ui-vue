<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Label } from '@repo/shadcn-vue/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/shadcn-vue/components/ui/select'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { config } = useConfig()

const COLOR_THEMES = [
  { name: 'neutral', label: 'Default' },
  { name: 'red', label: 'Red' },
  { name: 'rose', label: 'Rose' },
  { name: 'orange', label: 'Orange' },
  { name: 'green', label: 'Green' },
  { name: 'blue', label: 'Blue' },
  { name: 'yellow', label: 'Yellow' },
  { name: 'violet', label: 'Violet' },
]
</script>

<template>
  <div :class="cn('flex items-center gap-2', props.class)">
    <Label for="theme-selector" class="sr-only">
      Theme
    </Label>
    <Select v-model="config.activeTheme">
      <SelectTrigger
        id="theme-selector"
        size="sm"
        class="bg-secondary text-secondary-foreground border-secondary justify-start shadow-none *:data-[slot=select-value]:w-12"
      >
        <span class="font-medium">Theme:</span>
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem
          v-for="theme in COLOR_THEMES"
          :key="theme.name"
          :value="theme.name"
          class="data-[state=checked]:opacity-50"
        >
          {{ theme.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
