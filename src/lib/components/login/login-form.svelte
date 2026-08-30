<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { FieldGroup, Field, FieldLabel, FieldError } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';

	let {
		submitting = false,
		errorMessage,
		onsubmit
	}: {
		submitting?: boolean;
		errorMessage?: string;
		onsubmit: (event: SubmitEvent) => void;
	} = $props();
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form {onsubmit}>
			<FieldGroup>
				{#if errorMessage}
					<FieldError errors={[{ message: errorMessage }]} />
				{/if}

				<Field>
					<FieldLabel>Email</FieldLabel>
					<Input
						name="email"
						type="email"
						placeholder="m@example.com"
						autocomplete="email"
						required
					/>
				</Field>

				<Field>
					<FieldLabel>Password</FieldLabel>
					<Input
						name="password"
						type="password"
						autocomplete="current-password"
						required
						maxlength={128}
					/>
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
