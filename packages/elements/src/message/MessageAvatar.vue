<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/shadcn-vue/components/ui/avatar'
import { cn } from '@repo/shadcn-vue/lib/utils'

interface Props {
  src: string
  name?: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <Avatar :class="cn('ring-border size-8 ring-1', props.class)">
    <AvatarImage alt="" class="mt-0 mb-0" :src="src" />
    <AvatarFallback>{{ name?.slice(0, 2) || "ME" }}</AvatarFallback>
  </Avatar>
</template>
