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

const providers = [
	{
		label: "Google",
		icon: "i-simple-icons-google",
		onClick: () => {
			toast.add({ title: "Google", description: "Login with Google" });
		},
	},
	{
		label: "GitHub",
		icon: "i-simple-icons-github",
		onClick: () => {
			toast.add({ title: "GitHub", description: "Login with GitHub" });
		},
	},
];

function onSubmit(payload: FormSubmitEvent<SignUpSchema>) {
	signUp(payload.data, { callbackUrl: "/library" }).catch(
		(_: ErrorResponse) => {
			toast.add({ title: "Login failed" });
		},
	);
}
</script>

<template>
  <UAuthForm
    :fields="signUpFields"
    :schema="signUpSchema"
    :providers="providers"
    :submit="{ label: 'Create account' }"
    title="Create an account"
    @submit.prevent="onSubmit"
  >
    <template #footer>
      Already have an account?
      <ULink to="/login" class="text-primary font-medium">Login</ULink>.
    </template>
  </UAuthForm>
</template>
