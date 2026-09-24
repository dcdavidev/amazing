import axios from 'axios';

/**
 * Base URL resolved from Vite environment variables with fallback.
 */
const resolvedBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

/**
 * Shared pre-configured Axios instance.
 */
export const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
