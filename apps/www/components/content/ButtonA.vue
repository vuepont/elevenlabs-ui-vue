<script setup lang="ts">
import type { NuxtLinkProps } from 'nuxt/app'
import Button from '@repo/shadcn-vue/components/ui/button/Button.vue'

const props = defineProps<NuxtLinkProps>()
</script>

<template>
  <Button size="sm" as-child class="mt-6 no-underline">
    <NuxtLink v-bind="props">
      <slot />
    </NuxtLink>
  </Button>
</template>
