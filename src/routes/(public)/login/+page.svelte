<script lang="ts">
	import { LoginForm } from '$lib/components/login';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<div class="relative flex h-screen w-full items-center justify-center px-4">
	<div class="absolute top-4 right-4">
		<ThemeToggle />
	</div>
	<LoginForm {form} redirectTo={data.redirectTo} />
</div>
