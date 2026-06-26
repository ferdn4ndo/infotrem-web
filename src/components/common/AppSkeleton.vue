<script setup lang="ts">
export interface AppSkeletonProps {
  width?: string
  height?: string
  radius?: string
}

withDefaults(defineProps<AppSkeletonProps>(), {
  width: '100%',
  height: '16px',
  radius: '8px'
})
</script>

<template>
  <span class="AppSkeleton" :style="{ width, height, borderRadius: radius }" aria-hidden="true" />
</template>

<style lang="scss" scoped>
.AppSkeleton {
  display: inline-block;
  background: linear-gradient(
    90deg,
    var(--color-background-mute) 25%,
    var(--color-background-soft) 50%,
    var(--color-background-mute) 75%
  );
  background-size: 200% 100%;
  animation: AppSkeleton-Shimmer 1.2s ease-in-out infinite;
}

@keyframes AppSkeleton-Shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
