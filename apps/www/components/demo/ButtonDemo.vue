<script setup lang="ts">
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { ArrowUpIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 md:flex-row">
    <Button variant="outline">
      Button
    </Button>
    <Button variant="outline" size="icon" aria-label="Submit">
      <ArrowUpIcon />
    </Button>
  </div>
</template>
