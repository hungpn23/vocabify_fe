import { AuthApi } from "./auth.api";

class Api {
	auth: AuthApi;

	constructor() {
		this.auth = new AuthApi();
	}
}

export const api = new Api();
export * from "./auth.api";
export * from "./auth.type";
