<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as v from "valibot";
import { baseAuthSchema } from "~/features/auth/schemas";
import { pickFields } from "~/features/auth/utils";
import { api } from "~/shared/apis";
import { ERROR_MESSAGES } from "~/shared/constants";

definePageMeta({
	layout: "auth",
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/",
	},
});

useSeoMeta({ title: "Login with Magic Link" });

const schema = v.pick(baseAuthSchema, ["email"]);

const toast = useToast();

const requestSent = ref(false);

async function onSubmit(
	payload: FormSubmitEvent<v.InferOutput<typeof schema>>,
) {
	const response = await api.auth.sendMagicLink({ email: payload.data.email });

	requestSent.value = true;

	if (response.error.value) {
		toast.add({
			title: "Failed to login with email",
			description: response.error.value.data?.message || ERROR_MESSAGES.UNKNOWN,
			color: "error",
		});
		return;
	}

	if (response.data.value?.success) {
		toast.add({
			title: "We've sent you a login link!",
			description: "Please check your email for the login link.",
			color: "success",
		});
		return;
	}
}
</script>

<template>
  <UAuthForm
    v-if="!requestSent"
    :fields="pickFields(['email'])"
    :schema="schema"
    title="Sign in with Email"
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
