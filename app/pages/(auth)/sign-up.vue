<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as v from "valibot";
import { AUTH_SCHEMA, pickFields } from "~/features/auth";

definePageMeta({
	layout: "auth",
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/library",
	},
});

const schema = v.pipe(
	v.pick(AUTH_SCHEMA, ["email", "password", "confirmPassword"]),
	v.forward(
		v.partialCheck(
			[["password"], ["confirmPassword"]],
			(input) => input.password === input.confirmPassword,
			"Passwords do not match",
		),
		["confirmPassword"],
	),
);
const toast = useToast();
const auth = useAuth();

function onSubmit(payload: FormSubmitEvent<v.InferOutput<typeof schema>>) {
	auth
		.signUp(payload.data, { callbackUrl: "/library" })
		.then(() => {
			toast.add({
				title: "Sign up successful",
				color: "success",
			});
		})
		.catch(() => toast.add({ title: "Sign up failed" }));
}
</script>

<template>
  <UAuthForm
    :fields="pickFields(['email', 'password', 'confirmPassword'])"
    :schema="schema"
    title="Sign up to Vocabify"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account?
      <ULink to="/login" class="text-primary font-medium">Login</ULink>
    </template>
  </UAuthForm>
</template>
