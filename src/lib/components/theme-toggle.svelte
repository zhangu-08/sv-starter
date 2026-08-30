<script lang="ts">
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';

	import { Button } from '$lib/components/ui/button/index.js';
</script>

<Button variant="outline" size="icon-sm" onclick={toggleMode} aria-label="Toggle theme">
	<Sun class="dark:hidden" />
	<Moon class="hidden dark:block" />
</Button>
