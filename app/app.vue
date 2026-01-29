<script setup lang="ts">
const colorMode = useColorMode();

const color = computed(() =>
	colorMode.value === "dark" ? "#020618" : "white",
);

useHead({
	meta: [
		{ charset: "utf-8" },
		{ name: "viewport", content: "width=device-width, initial-scale=1" },
		{ key: "theme-color", name: "theme-color", content: color },
	],
	htmlAttrs: {
		lang: "en",
	},
});
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
