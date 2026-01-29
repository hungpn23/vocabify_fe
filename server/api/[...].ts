import { defineEventHandler, proxyRequest } from "h3";
import { joinURL } from "ufo";

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const target = joinURL(config.apiUrl, event.path);

	return await proxyRequest(event, target);
});
