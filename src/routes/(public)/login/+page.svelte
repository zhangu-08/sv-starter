<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { authClient } from '$lib/auth-client';
	import { LoginForm } from '$lib/components/login';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let submitting = $state(false);
	let errorMessage = $state<string | undefined>();

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;

		const formData = new FormData(form);
		const email = String(formData.get('email') ?? '');
		const password = String(formData.get('password') ?? '');

		submitting = true;
		errorMessage = undefined;

		const { error } = await authClient.signIn.email({ email, password });

		if (error) {
			errorMessage =
				error.status === 429
					? 'Too many sign-in attempts. Try again later.'
					: error.message || 'Sign in failed';
			submitting = false;
			return;
		}

		await goto(resolve(data.redirectTo as '/'));
	}
</script>

<div class="relative flex h-screen w-full items-center justify-center px-4">
	<div class="absolute top-4 right-4">
		<ThemeToggle />
	</div>
	<LoginForm {submitting} {errorMessage} {onsubmit} />
</div>
