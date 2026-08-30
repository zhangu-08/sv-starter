import { z } from 'zod';

import type { FormEchoValues, FormFailure, FormFieldErrors, FormFields } from '$lib/forms';

export type ParsedFormSuccess<T> = {
	success: true;
	data: T;
};

export type ParsedFormFailure<T extends z.ZodType, Echo extends FormFields<T>> = {
	success: false;
	values: FormEchoValues<Echo>;
	errors: FormFieldErrors<T>;
	/** Schema-level issues (`.refine` / `.superRefine`). Empty when every check is field-level. */
	formErrors: string[];
};

/** Action-failure payload. `message` is omitted unless the schema raised a form-level issue. */
export function toFormFailure<T extends z.ZodType, Echo extends FormFields<T>>(
	parsed: ParsedFormFailure<T, Echo>
): FormFailure<T, Echo> {
	const message = parsed.formErrors[0];
	return {
		values: parsed.values,
		errors: parsed.errors,
		...(message ? { message } : {})
	};
}

/**
 * First string value per key; File entries ignored.
 * Checkbox groups and `<select multiple>` need a different helper — this one
 * does not collect every value for a repeated name.
 */
export function parseFormData<T extends z.ZodType, Echo extends FormFields<T>>(
	formData: FormData,
	schema: T,
	options: { echo: readonly Echo[] }
): ParsedFormSuccess<z.infer<T>> | ParsedFormFailure<T, Echo> {
	const submitted: Record<string, string> = {};

	for (const [key, value] of formData.entries()) {
		if (typeof value === 'string' && !(key in submitted)) {
			submitted[key] = value;
		}
	}

	const values = Object.fromEntries(
		options.echo.map((key) => [key, submitted[key] ?? ''])
	) as FormEchoValues<Echo>;

	const result = schema.safeParse(submitted);

	if (!result.success) {
		const flattened = z.flattenError(result.error);
		return {
			success: false,
			values,
			errors: flattened.fieldErrors,
			formErrors: flattened.formErrors
		};
	}

	return { success: true, data: result.data };
}
