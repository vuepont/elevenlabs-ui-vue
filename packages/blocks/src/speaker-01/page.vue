<script lang="ts">
export const description = 'EL-01 Speaker'
</script>

<script setup lang="ts">
import Speaker from './components/Speaker.vue'
</script>

<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <Speaker />
    </div>
  </div>
</template>
