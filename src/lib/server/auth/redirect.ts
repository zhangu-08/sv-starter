const REDIRECT_TO = 'redirectTo';

export function safeRedirect(target: string | null): string {
	if (!target?.startsWith('/')) return '/';
	if (target.startsWith('//') || target.startsWith('/\\')) return '/';
	return target;
}

export function loginUrl(url: URL): string {
	const target = url.pathname + url.search;
	if (target === '/') return '/login';
	return `/login?${REDIRECT_TO}=${encodeURIComponent(target)}`;
}

export function requestedRedirect(url: URL): string {
	return safeRedirect(url.searchParams.get(REDIRECT_TO));
}
