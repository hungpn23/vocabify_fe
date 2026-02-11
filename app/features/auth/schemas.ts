import * as v from "valibot";

export const baseAuthSchema = v.object({
	email: v.message(
		v.pipe(v.string(), v.email()),
		"Please enter a valid email address.",
	),
	password: v.message(
		v.pipe(
			v.string(),
			v.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&*@^]).{8,}$/),
		),
		"Password must contain at least 8 characters, including uppercase, lowercase, number, and special characters.",
	),
	confirmPassword: v.pipe(v.string()),
});
