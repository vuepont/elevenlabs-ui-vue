<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/shadcn-vue/components/ui/card'
import { cn } from '@repo/shadcn-vue/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader>
        <CardTitle>Button</CardTitle>
        <CardDescription>
          A simple button.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" type="button">
          Button
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
