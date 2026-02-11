import type { AuthFormField, ButtonProps } from "@nuxt/ui";
import type { AuthField, ProviderId } from "./types";

export const DEFAULT_FIELDS: AuthFormField[] = [
	{
		name: "email" satisfies AuthField,
		type: "email" as const,
		label: "Email",
		placeholder: "Enter your email",
		required: true,
	},
	{
		name: "password" satisfies AuthField,
		label: "Password",
		type: "password" as const,
		placeholder: "Enter your password",
		required: true,
	},
	{
		name: "confirmPassword" satisfies AuthField,
		label: "Confirm password",
		type: "password" as const,
		placeholder: "Enter your confirm password",
		required: true,
	},
] as const;

export const AUTH_PROVIDERS: (ButtonProps & { id: ProviderId })[] = [
	{
		id: "google" satisfies ProviderId,
		label: "Continue with Google",
		icon: "i-simple-icons-google",
	},
	{
		id: "github" satisfies ProviderId,
		label: "Continue with GitHub",
		icon: "i-simple-icons-github",
	},
	{
		id: "magic-link" satisfies ProviderId,
		label: "Continue with Email",
		icon: "i-simple-icons-simplelogin",
	},
] as const;
