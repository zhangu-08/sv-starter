import { getContext, setContext } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';

const KEY = Symbol('field');

export type FieldContext = {
	id: string;
	descriptionId: string;
	errorId: string;
	readonly invalid: boolean;
};

export function setFieldContext(field: FieldContext): FieldContext {
	setContext(KEY, field);
	return field;
}

export function getFieldContext(): FieldContext | undefined {
	return getContext(KEY);
}

export function fieldControlAttrs(
	field: FieldContext | undefined,
	overrides: {
		id?: HTMLInputAttributes['id'];
		'aria-invalid'?: HTMLInputAttributes['aria-invalid'];
		'aria-describedby'?: HTMLInputAttributes['aria-describedby'];
	} = {}
): {
	id: string | undefined;
	'aria-invalid': HTMLInputAttributes['aria-invalid'];
	'aria-describedby': string | undefined;
} {
	const describedBy = [
		field?.invalid ? field.errorId : undefined,
		overrides['aria-describedby'] || undefined
	]
		.filter((id): id is string => Boolean(id))
		.join(' ');

	return {
		id: overrides.id ?? field?.id,
		'aria-invalid': overrides['aria-invalid'] ?? (field?.invalid ? true : undefined),
		'aria-describedby': describedBy || undefined
	};
}
