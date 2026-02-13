import type { ErrorResponse, SuccessResponse } from "../types";
import type { TokenPairResponse } from "./auth.type";

export class AuthApi {
	private readonly BASE_URL = "/api/auth";
	private readonly MAGIC_LINK_URL = `${this.BASE_URL}/magic-link`;
	private readonly VERIFY_TOKEN_URL = `${this.BASE_URL}/verify-token`;

	requestMagicLinkMutation(email: Ref<string>) {
		return useFetch<SuccessResponse, ErrorResponse>(this.MAGIC_LINK_URL, {
			method: "POST",
			body: { email },
			immediate: false,
		});
	}

	verifyTokenMutation(token: Ref<string>) {
		return useFetch<TokenPairResponse, ErrorResponse>(this.VERIFY_TOKEN_URL, {
			method: "POST",
			query: { token },
			immediate: false,
		});
	}
}
