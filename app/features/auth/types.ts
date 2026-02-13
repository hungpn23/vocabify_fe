export type AuthField = "email" | "password" | "confirmPassword";
export type ProviderId = "google" | "github" | "magic-link";
export type GoogleQueryParams = {
	client_id: string;
	redirect_uri: string;
	response_type: "code";
	scope: string;
	state?: string;
	include_granted_scopes?: "true" | "false";
	prompt?: "none" | "consent" | "select_account";
};
export type TokenPairResponse = {
	accessToken: string;
	refreshToken: string;
};
