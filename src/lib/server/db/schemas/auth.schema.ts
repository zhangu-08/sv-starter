import { defineRelations, sql } from 'drizzle-orm';
import { index, integer, snakeCase, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const user = snakeCase.table('user', {
	id: text().primaryKey(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: integer({ mode: 'boolean' }).default(false).notNull(),
	image: text(),
	createdAt: integer({ mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer({ mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const session = snakeCase.table(
	'session',
	{
		id: text().primaryKey(),
		expiresAt: integer({ mode: 'timestamp_ms' }).notNull(),
		token: text().notNull().unique(),
		createdAt: integer({ mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer({ mode: 'timestamp_ms' })
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text(),
		userAgent: text(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = snakeCase.table(
	'account',
	{
		id: text().primaryKey(),
		issuer: text().notNull(),
		accountId: text().notNull(),
		providerId: text().notNull(),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		accessTokenExpiresAt: integer({ mode: 'timestamp_ms' }),
		refreshTokenExpiresAt: integer({ mode: 'timestamp_ms' }),
		scope: text(),
		password: text(),
		createdAt: integer({ mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer({ mode: 'timestamp_ms' })
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('account_issuer_accountId_uidx').on(table.issuer, table.accountId),
		index('account_userId_idx').on(table.userId)
	]
);

export const verification = snakeCase.table(
	'verification',
	{
		id: text().primaryKey(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: integer({ mode: 'timestamp_ms' }).notNull(),
		createdAt: integer({ mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer({ mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const authRelations = defineRelations({ user, session, account }, (r) => ({
	user: {
		sessions: r.many.session({
			from: r.user.id,
			to: r.session.userId
		}),
		accounts: r.many.account({
			from: r.user.id,
			to: r.account.userId
		})
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id
		})
	},
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id
		})
	}
}));
