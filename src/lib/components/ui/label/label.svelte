<script lang="ts">
	import { getFieldContext } from '$lib/components/ui/field/field-context.js';
	import { cn, type WithElementRef } from '$lib/utils/cn.js';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		for: htmlFor,
		...restProps
	}: WithElementRef<HTMLLabelAttributes, HTMLLabelElement> = $props();

	const field = getFieldContext();
	const controlId = $derived(htmlFor ?? field?.id);
</script>

<label
	bind:this={ref}
	for={controlId}
	data-slot="label"
	class={cn(
		'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
		className
	)}
	onmousedown={(e) => {
		if (e.detail > 1) e.preventDefault();
	}}
	{...restProps}
>
	{@render children?.()}
</label>
