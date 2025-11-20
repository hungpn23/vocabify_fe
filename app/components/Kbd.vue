<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<template>
  <kbd
    class="rounded-sm border border-b-2 border-gray-300 bg-white px-1 font-medium text-current shadow-md dark:border-gray-500 dark:bg-gray-800 dark:shadow-gray-100/15"
  >
    {{ label }}
  </kbd>
</template>
