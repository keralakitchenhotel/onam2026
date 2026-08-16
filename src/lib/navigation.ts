export const PORTAL_PATHS = [
  '/admin',
  '/staff',
  '/kitchen',
  '/delivery',
  '/deliver',
  '/dashboard',
  '/login',
];

export function isPortalPath(pathname: string): boolean {
  return PORTAL_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
