import type { ErrorResponse, SuccessResponse } from "../types";
import type { MagicLinkBody } from "./auth.type";

export class AuthApi {
	private readonly BASE_URL = "/api/auth";
	private readonly MAGIC_LINK_URL = `${this.BASE_URL}/magic-link`;

	async sendMagicLink(body: MagicLinkBody) {
		const { execute, ...rest } = useFetch<SuccessResponse, ErrorResponse>(
			this.MAGIC_LINK_URL,
			{
				method: "POST",
				body,
				immediate: false,
			},
		);

		await execute();

		return rest;
	}
}
