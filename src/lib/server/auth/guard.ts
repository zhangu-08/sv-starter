import { building } from '$app/env';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';

/** Route IDs keep `(group)` segments even though URLs drop them. */
const PUBLIC_ROUTE_GROUP = '/(public)';

const REDIRECT_TO_PARAM = 'redirectTo';

export function requiresSession(event: RequestEvent): boolean {
	// Unmatched paths 404; Better Auth is hook-mounted so it has no route id either.
	if (event.route.id === null) return false;

	return !event.route.id.startsWith(PUBLIC_ROUTE_GROUP);
}

export function rejectAnonymous(event: RequestEvent): never {
	if (building) {
		throw new Error(
			`Cannot prerender ${event.route.id}: this route requires a session. Remove prerender = true or move it under (public).`
		);
	}

	if (isApiRoute(event.route.id)) {
		error(401, 'Unauthorized');
	}

	redirect(303, loginUrl(event.url));
}

/** Groups stay in the route id, so `/api/` is not always a prefix. */
function isApiRoute(routeId: string | null): boolean {
	if (!routeId) return false;
	return routeId.includes('/api/') || routeId.endsWith('/api');
}

function loginUrl(url: URL): string {
	const target = url.pathname + url.search;
	if (target === '/') return '/login';
	return `/login?${REDIRECT_TO_PARAM}=${encodeURIComponent(target)}`;
}

export function requestedRedirect(url: URL): string {
	return safeRedirect(url.searchParams.get(REDIRECT_TO_PARAM));
}

function safeRedirect(target: string | null): string {
	if (!target?.startsWith('/')) return '/';
	// `//host` and `/\host` are protocol-relative to browsers.
	if (target.startsWith('//') || target.startsWith('/\\')) return '/';
	return target;
}

export function requireUser(locals: App.Locals) {
	if (!locals.user) error(401, 'Unauthorized');
	return locals.user;
}
