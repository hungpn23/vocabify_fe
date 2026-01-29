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
	title: "Login",
	description: "Login to your account to continue",
});

const toast = useToast();
const { signIn } = useAuth();
const config = useRuntimeConfig();

const providers = [
	{
		label: "Google",
		class: "cursor-pointer",
		icon: "i-simple-icons-google",
		onClick: onGoogleLogin,
	},
	{
		label: "Github",
		class: "cursor-pointer",
		icon: "i-simple-icons-github",
		onClick: () => {
			toast.add({ title: "GitHub", description: "Login with GitHub" });
		},
	},
];

function onGoogleLogin() {
	const options: GoogleQueryParams = {
		redirect_uri: config.public.googleRedirectUri,
		client_id: config.public.googleClientId,
		response_type: "code",
		scope:
			"https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
		prompt: "select_account",
	};

	const searchParams = new URLSearchParams(options);

	window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${searchParams.toString()}`;
}

function onSubmit(payload: FormSubmitEvent<LogInSchema>) {
	signIn(payload.data, { callbackUrl: "/library" }).catch(() => {
		toast.add({ title: "Login failed" });
	});
}
</script>

<template>
  <UAuthForm
    :fields="logInFields"
    :schema="logInSchema"
    :providers="providers"
    title="Better Quizlet"
    @submit.prevent="onSubmit"
  >
    <template #password-hint>
      <ULink to="/" class="text-primary font-medium" tabindex="-1"
        >Forgot password?</ULink
      >
    </template>

    <template #footer>
      Don't have an account?
      <ULink to="/signup" class="text-primary font-medium">Sign up</ULink>.
    </template>
  </UAuthForm>
</template>
