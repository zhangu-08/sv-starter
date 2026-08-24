import { usersTable } from '$lib/server/db/schemas';

import { db } from '$lib/server/db';

export async function seedUser() {
	const user: typeof usersTable.$inferInsert = {
		name: 'Zhang',
		age: 39,
		email: 'zhang@example.com'
	};

	await db.insert(usersTable).values(user);
	console.log('New user created!');
}
