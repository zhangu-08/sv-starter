<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils/cn.js';
	import type { HTMLAttributes } from 'svelte/elements';

	import { getFieldContext } from './field-context.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		id,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLParagraphElement>> = $props();

	const field = getFieldContext();
</script>

<p
	bind:this={ref}
	id={id ?? field?.descriptionId}
	data-slot="field-description"
	class={cn(
		'text-muted-foreground text-left text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance [[data-variant=legend]+&]:-mt-1.5',
		'last:mt-0 nth-last-2:-mt-1',
		'[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</p>
