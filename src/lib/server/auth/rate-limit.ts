/**
 * Per-process sliding windows. `auth.api.*` skips Better Auth's router limiter;
 * this is the replacement for the login action. Multi-instance deploys need a
 * shared store.
 */

export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_MAX_PER_IP = 10;
export const LOGIN_MAX_PER_EMAIL = 5;

const buckets = new Map<string, number[]>();

function prune(hits: number[], now: number): number[] {
	return hits.filter((t) => now - t < LOGIN_WINDOW_MS);
}

function peek(
	key: string,
	max: number
): { limited: false } | { limited: true; retryAfterSec: number } {
	const now = Date.now();
	const hits = prune(buckets.get(key) ?? [], now);

	if (hits.length === 0) buckets.delete(key);
	else buckets.set(key, hits);

	if (hits.length >= max) {
		const retryAfterSec = Math.max(1, Math.ceil((hits[0]! + LOGIN_WINDOW_MS - now) / 1000));
		return { limited: true, retryAfterSec };
	}

	return { limited: false };
}

function hit(key: string) {
	const now = Date.now();
	const hits = prune(buckets.get(key) ?? [], now);
	hits.push(now);
	buckets.set(key, hits);
}

function ipKey(ip: string) {
	return `ip:${ip}`;
}

function emailKey(email: string) {
	return `email:${email.trim().toLowerCase()}`;
}

export function loginThrottleStatus(ip: string, email: string) {
	const byIp = peek(ipKey(ip), LOGIN_MAX_PER_IP);
	if (byIp.limited) return byIp;

	const byEmail = peek(emailKey(email), LOGIN_MAX_PER_EMAIL);
	if (byEmail.limited) return byEmail;

	return { limited: false as const };
}

export function loginRetryMessage(retryAfterSec: number): string {
	const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
	const wait = minutes === 1 ? '1 minute' : `${minutes} minutes`;
	return `Too many sign-in attempts. Try again in ${wait}.`;
}

export function recordFailedLogin(ip: string, email: string) {
	hit(ipKey(ip));
	hit(emailKey(email));
}
