<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'
import Button from '@repo/shadcn-vue/components/ui/button/Button.vue'
import { ConfigProvider } from 'reka-ui'

defineProps<{
  error: NuxtError
}>()

const useIdFunction = () => useId()
</script>

<template>
  <SiteBody>
    <ConfigProvider>
      <NuxtLayout name="default" :use-id="useIdFunction">
        <div class="flex flex-col items-center justify-center gap-6 text-center min-h-[80vh]">
          <PageHeader>
            <PageHeaderHeading>{{ error.statusCode }}</PageHeaderHeading>
            <PageHeaderDescription>{{ error.message }}</PageHeaderDescription>
            <Button as-child class="w-fit mt-6">
              <NuxtLink to="/">
                Go back home
              </NuxtLink>
            </Button>
          </PageHeader>
        </div>
      </NuxtLayout>
    </ConfigProvider>
  </SiteBody>
</template>
