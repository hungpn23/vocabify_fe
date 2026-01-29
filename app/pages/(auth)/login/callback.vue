<script lang="ts" setup>
definePageMeta({
	layout: "callback",
	auth: {
		unauthenticatedOnly: true,
		navigateAuthenticatedTo: "/",
	},
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { setToken, rawRefreshToken } = useAuthState();
const { getSession } = useAuth();

const loading = ref(false);

const code = computed(() => route.query.code as string);

onMounted(async () => {
	loading.value = true;

	if (!code.value) return router.push("/login");

	$fetch<TokenPair>("/api/auth/google/exchange", {
		method: "POST",
		body: { code: code.value },
	})
		.then(async (res) => {
			setToken(res.accessToken);
			rawRefreshToken.value = res.refreshToken;

			await getSession();

			toast.add({
				title: "Login success",
				description: "You have successfully logged in.",
				color: "success",
			});

			await navigateTo("/library");
		})
		.catch(async (error: ErrorResponse) => {
			console.error("Exchange token error:", error);

			toast.add({
				title: "Login Failed",
				description: "Failed to verify Google login.",
				color: "error",
			});

			await navigateTo("/login");
		})
		.finally(() => {
			loading.value = false;
		});
});
</script>

<template>
  <div class="flex flex-col place-items-center gap-4">
    <UIcon
      class="text-primary h-12 w-12 animate-spin"
      name="i-lucide-loader-2"
    />

    <h1 class="text-xl font-semibold">Verifying...</h1>
  </div>
</template>

<style scoped></style>
