<script lang="ts">
	import { enhance } from '$app/forms';

	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	import type { SignInFormFailure } from '$lib/schemas';

	let {
		form,
		redirectTo = '/'
	}: {
		form?: SignInFormFailure | null;
		redirectTo?: string;
	} = $props();

	// In the action URL rather than a hidden field so it survives a failed submit.
	const action = $derived(
		redirectTo === '/'
			? '?/signInEmail'
			: `?/signInEmail&redirectTo=${encodeURIComponent(redirectTo)}`
	);

	let submitting = $state(false);

	function fieldErrors(messages: string[] | undefined) {
		return messages?.map((message) => ({ message }));
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="POST"
			{action}
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<FieldGroup>
				{#if form?.message}
					<FieldError errors={[{ message: form.message }]} />
				{/if}

				<Field data-invalid={form?.errors?.email ? true : undefined}>
					<FieldLabel>Email</FieldLabel>
					<Input
						name="email"
						type="email"
						placeholder="m@example.com"
						autocomplete="email"
						required
						value={form?.values?.email ?? ''}
					/>
					<FieldError errors={fieldErrors(form?.errors?.email)} />
				</Field>

				<Field data-invalid={form?.errors?.password ? true : undefined}>
					<FieldLabel>Password</FieldLabel>
					<Input name="password" type="password" autocomplete="current-password" required />
					<FieldError errors={fieldErrors(form?.errors?.password)} />
				</Field>

				<Field>
					<Button type="submit" class="w-full" disabled={submitting}>
						{submitting ? 'Signing in…' : 'Login'}
					</Button>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
