<script setup lang="ts">
import type { IconProps } from "@nuxt/ui";

// Định nghĩa props
defineProps<{
	label?: string | number;
	icon?: IconProps & { size?: number };
}>();
</script>

<template>
  <kbd
    class="mx-1 inline-flex h-6.75 min-w-10 place-content-center place-items-center rounded border border-b-2 border-gray-300 bg-white px-1.5 text-center text-xs font-semibold shadow-md dark:border-gray-500 dark:bg-gray-800"
  >
    <UIcon
      v-if="icon?.name"
      :class="`size-${icon.size || 5}`"
      :name="icon.name"
    />

    <span v-else class="leading-none">{{ label }}</span>
  </kbd>
</template>
