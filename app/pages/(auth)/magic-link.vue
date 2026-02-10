<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
	layout: "auth",
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/",
	},
});

useSeoMeta({
	title: "Login with Magic Link",
});

const toast = useToast();

const requestSent = ref(false);

function onSubmit(payload: FormSubmitEvent<MagicLinkSchema>) {
	$fetch(`/api/auth/magic-link`, {
		method: "POST",
		body: { email: payload.data.email },
	})
		.catch(() => toast.add({ title: "Login failed", color: "error" }))
		.finally(() => {
			requestSent.value = true;
		});
}
</script>

<template>
  <UAuthForm
    v-if="!requestSent"
    :fields="magicLinkFields"
    :schema="magicLinkSchema"
    title="Vocabify"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account?
      <ULink to="/sign-up" class="text-primary font-medium">Sign up</ULink>
    </template>
  </UAuthForm>

  <UContainer v-else class="sm:px-0 lg:px-0 px-0">
    <div class="flex place-items-center place-content-between gap-4">
      <UIcon name="i-lucide-circle-check-big" class="text-success size-10" />

      <div class="flex flex-col gap-2">
        <h1 class="font-medium">We've sent a login link to your email.</h1>
        <p class="text-sm text-muted-foreground">You can safely close this page.</p>
      </div>
    </div>
  </UContainer>
</template>
