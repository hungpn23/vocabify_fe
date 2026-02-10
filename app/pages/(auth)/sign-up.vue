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
	title: "Sign up",
	description: "Create an account to get started",
});

const toast = useToast();
const { signUp } = useAuth();

function onSubmit(payload: FormSubmitEvent<SignUpSchema>) {
	signUp(payload.data, { callbackUrl: "/library" }).catch(() =>
		toast.add({ title: "Sign up failed" }),
	);
}
</script>

<template>
  <UAuthForm
    :fields="signUpFields"
    :schema="signUpSchema"
    :submit="{ label: 'Sign Up' }"
    title="Welcome!"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account?
      <ULink to="/login" class="text-primary font-medium">Login</ULink>
    </template>
  </UAuthForm>
</template>
