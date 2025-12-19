<script setup lang="ts">
import { Button } from '@repo/shadcn-vue/components/ui/button'

const FEATURED_BLOCKS: string[] = []
</script>

<template>
  <div class="flex flex-col gap-12 md:gap-24">
    <BlockDisplay v-for="name in FEATURED_BLOCKS" :key="name" :name="name" />

    <div class="container-wrapper">
      <div class="container flex justify-center py-6">
        <Button as-child variant="outline">
          <NuxtLink to="/blocks/agents">
            Browse more blocks
          </NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
