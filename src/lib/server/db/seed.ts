import { seedUser } from './seed/user';

async function main() {
	await seedUser();
}

main();
