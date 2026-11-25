/** Public site origin for invite links, OAuth callbacks, redirects. */
export function appBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
