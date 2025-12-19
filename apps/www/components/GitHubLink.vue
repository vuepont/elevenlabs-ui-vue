<script setup lang="ts">
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { siteConfig } from '@/lib/config'
import { Icons } from './Icons'
// import { Skeleton } from '@repo/shadcn-vue/components/ui/skeleton'

// const { data, pending } = useLazyFetch('https://ungh.cc/repos/xxx/xxx')

// const stars = computed(() => {
//   const count = (data.value as any)?.repo?.stars
//   if (!count)
//     return null
//   return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toLocaleString()
// })
</script>

<template>
  <Button as-child size="sm" variant="ghost" class="h-8 shadow-none">
    <NuxtLink :to="siteConfig.links.github" target="_blank" rel="noreferrer">
      <Icons.gitHub />

      <!-- <Skeleton v-if="pending" class="h-4 w-8" />
      <span v-else class="text-muted-foreground w-8 text-xs tabular-nums">
        {{ stars }}
      </span> -->
    </NuxtLink>
  </Button>
</template>
