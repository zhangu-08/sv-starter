<script lang="ts">
	import { resolve } from '$app/paths';

	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<header class="flex items-center justify-between border-b px-4 py-2">
	<span class="text-muted-foreground text-sm">{data.user.email}</span>
	<div class="flex items-center gap-2">
		<ThemeToggle />
		<form method="POST" action={resolve('/logout')}>
			<Button type="submit" variant="outline" size="sm">Log out</Button>
		</form>
	</div>
</header>

{@render children()}
