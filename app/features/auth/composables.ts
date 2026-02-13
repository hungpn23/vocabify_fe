export const useAuthToasts = () => {
	const toast = useToast();

	return {
		loginSuccess: (username?: string) => {
			toast.add({
				title: `Welcome back, ${username}.`,
				description: "You have successfully logged in.",
				color: "success",
				icon: "i-lucide-circle-check-big",
			});
		},
		loginFailed: () => {
			toast.add({
				title: "Login failed.",
				description: "Please check your credentials and try again.",
				color: "error",
				icon: "i-lucide-circle-x",
			});
		},
		signUpSuccess: (username?: string) => {
			toast.add({
				title: `Welcome to Vocabify, ${username}.`,
				description: "You have successfully signed up.",
				color: "success",
				icon: "i-lucide-circle-check-big",
			});
		},
		signUpFailed: () => {
			toast.add({
				title: "Sign up failed.",
				description: "Please check your credentials and try again.",
				color: "error",
				icon: "i-lucide-circle-x",
			});
		},
		requestMagicLinkSuccess: (email: string) => {
			toast.add({
				title: "We've sent you a login link!",
				description: `Please check your email ${email} for the login link.`,
				color: "success",
				icon: "i-lucide-mail-check",
			});
		},
		requestMagicLinkFailed: () => {
			toast.add({
				title: "Failed to send login link.",
				description: "Please check your input and try again.",
				color: "error",
				icon: "i-lucide-circle-x",
			});
		},
		verifyTokenFailed: () => {
			toast.add({
				title: "Failed to verify token.",
				description: "Please try again.",
				color: "error",
				icon: "i-lucide-circle-x",
			});
		},
	};
};
