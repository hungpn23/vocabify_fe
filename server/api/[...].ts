import { defineEventHandler } from 'h3';
import { joinURL } from 'ufo';

export default defineEventHandler(async (event) => {
  console.log('🔥🔥🔥 event.path', event.path);
  console.log('🔥🔥🔥 useRuntimeConfig().apiUrl', useRuntimeConfig().apiUrl);
  console.log(joinURL(useRuntimeConfig().apiUrl, event.path));

  return await proxyRequest(
    event,
    joinURL(useRuntimeConfig().apiUrl, event.path),
  );
});
