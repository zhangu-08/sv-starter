<script lang="ts">
	import { fieldControlAttrs, getFieldContext } from '$lib/components/ui/field/field-context.js';
	import { cn, type WithElementRef } from '$lib/utils/cn.js';
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';

	type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'> &
			({ type: 'file'; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		'data-slot': dataSlot = 'input',
		id,
		'aria-invalid': ariaInvalid,
		'aria-describedby': ariaDescribedBy,
		...restProps
	}: Props = $props();

	const field = getFieldContext();
	const control = $derived(
		fieldControlAttrs(field, {
			id,
			'aria-invalid': ariaInvalid,
			'aria-describedby': ariaDescribedBy
		})
	);
</script>

{#if type === 'file'}
	<input
		bind:this={ref}
		id={control.id}
		data-slot={dataSlot}
		class={cn(
			'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 file:text-foreground placeholder:text-muted-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
			className
		)}
		type="file"
		aria-invalid={control['aria-invalid']}
		aria-describedby={control['aria-describedby']}
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		id={control.id}
		data-slot={dataSlot}
		class={cn(
			'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 file:text-foreground placeholder:text-muted-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
			className
		)}
		{type}
		aria-invalid={control['aria-invalid']}
		aria-describedby={control['aria-describedby']}
		bind:value
		{...restProps}
	/>
{/if}
