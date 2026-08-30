import type { z } from 'zod';

export type FormFields<T extends z.ZodType> = Extract<keyof z.infer<T>, string>;

export type FormEchoValues<Echo extends string> = { [K in Echo]: string };

export type FormFieldErrors<T extends z.ZodType> = {
	[P in FormFields<T>]?: string[];
};

/** Action-failure payload: only `echo` fields are sent back to the client. */
export type FormFailure<T extends z.ZodType, Echo extends FormFields<T> = FormFields<T>> = {
	values: FormEchoValues<Echo>;
	errors?: FormFieldErrors<T>;
	message?: string;
};
