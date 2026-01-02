<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { ArrowDownIcon } from 'lucide-vue-next'
import { useStickToBottomContext } from 'vue-stick-to-bottom'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { isAtBottom, scrollToBottom } = useStickToBottomContext()
</script>

<template>
  <Button
    v-if="!isAtBottom"
    :class="cn(
      'bg-background dark:bg-background absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full shadow-md',
      props.class,
    )"
    size="icon"
    variant="outline"
    type="button"
    @click="scrollToBottom"
  >
    <ArrowDownIcon class="size-4" />
  </Button>
</template>
