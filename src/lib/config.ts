// Change VITE_BASE_URL in your .env to update the domain everywhere at once.
// Falls back to link.merqato.digital if the env var is not set.
export const BASE_URL =
  (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'https://link.merqato.digital';

export const BASE_HOST = BASE_URL.replace(/^https?:\/\//, '');
