<script lang="ts">
export const description = 'A simple button.'
</script>

<script setup lang="ts">
import CustomButton from './components/CustomButton.vue'
</script>

<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <CustomButton />
    </div>
  </div>
</template>
