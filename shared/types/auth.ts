import * as v from "valibot";

export const logInSchema = v.object({
	username: v.pipe(
		v.string(),
		v.minLength(6, "Must be at least 6 characters"),
		v.maxLength(20, "Must be at most 20 characters"),
	),
	password: v.message(
		v.pipe(
			v.string(),
			v.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&*@^]).{8,}$/),
		),
		"Password must contain at least 8 characters, including uppercase, lowercase, number, and special characters.",
	),
});

export const signUpSchema = v.pipe(
	v.object({
		loginSchema: logInSchema,
		confirmPassword: v.pipe(v.string()),
	}),
	v.forward(
		v.partialCheck(
			[["loginSchema"], ["confirmPassword"]],
			(input) => input.loginSchema.password === input.confirmPassword,
			"Passwords do not match",
		),
		["confirmPassword"],
	),
);

export type LogInSchema = v.InferOutput<typeof logInSchema>;
export type SignUpSchema = v.InferOutput<typeof signUpSchema>;

export type GoogleQueryParams = {
	client_id: string;
	redirect_uri: string;
	response_type: "code";
	scope: string;
	state?: string;
	include_granted_scopes?: "true" | "false";
	prompt?: "none" | "consent" | "select_account";
};

export type TokenPair = {
	accessToken: string;
	refreshToken: string;
};
