export const clerkConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined,
  enabled: Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
};

/**
 * The local session remains the preview fallback until Clerk callbacks and
 * server-side token verification are configured in the deployment environment.
 */
export function isClerkConfigured() {
  return clerkConfig.enabled;
}
