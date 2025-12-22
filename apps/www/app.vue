<script setup lang="ts">
import { Toaster } from '@repo/shadcn-vue/components/ui/sonner'
import { ConfigProvider, TooltipProvider } from 'reka-ui'

const { config, isLayoutFull } = useConfig()
const activeTheme = computed(() => config.value.activeTheme)
const isScaled = computed(() => !!activeTheme.value?.endsWith('-scaled'))
const colorMode = useColorMode()
</script>

<template>
  <SiteBody>
    <ConfigProvider>
      <TooltipProvider>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </TooltipProvider>
    </ConfigProvider>

    <ClientOnly>
      <Toaster class="pointer-events-auto" :theme="colorMode.preference as any || 'system'" position="top-center" />
    </ClientOnly>
  </SiteBody>
</template>
