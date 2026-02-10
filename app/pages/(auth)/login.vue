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

const router = useRouter();
const toast = useToast();
const { signIn } = useAuth();
const config = useRuntimeConfig();

const providers = [
	{
		label: "Google",
		icon: "i-simple-icons-google",
		onClick: onGoogleLogin,
	},
	{
		label: "Github",
		icon: "i-simple-icons-github",
		onClick: () => {
			toast.add({ title: "GitHub", description: "Login with GitHub" });
		},
	},
	{
		label: "Magic Link",
		icon: "i-simple-icons-simplelogin",
		onClick: () => router.push("/magic-link"),
	},
];

function onGoogleLogin() {
	const scope = [
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
	].join(" ");

	const options: GoogleQueryParams = {
		redirect_uri: config.public.googleRedirectUri,
		client_id: config.public.googleClientId,
		response_type: "code",
		scope,
		prompt: "select_account",
	};

	const searchParams = new URLSearchParams(options).toString();

	window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${searchParams}`;
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
    title="Vocabify"
    @submit.prevent="onSubmit"
  >
    <template #password-hint>
      <ULink to="/" class="text-primary font-medium" tabindex="-1">
        Forgot password?
      </ULink>
    </template>

    <template #description>
      Don't have an account?
      <ULink to="/sign-up" class="text-primary font-medium">Sign up</ULink>
    </template>
  </UAuthForm>
</template>
