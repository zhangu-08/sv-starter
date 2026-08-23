<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';

	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		rel="preload"
		href={geistLatin}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

{@render children()}
