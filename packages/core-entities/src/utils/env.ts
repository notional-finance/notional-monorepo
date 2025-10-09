/**
 * Safe access to process.env for Cloudflare Workers compatibility
 * This function safely accesses environment variables without throwing errors
 * in environments where process is not defined (like Cloudflare Workers)
 */
export const getEnvVar = (key: string): string | undefined => {
  try {
    return typeof process !== 'undefined' && process.env
      ? process.env[key]
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Get environment variable with fallback value
 */
export const getEnvVarWithFallback = (
  key: string,
  fallback: string
): string => {
  return getEnvVar(key) || fallback;
};
