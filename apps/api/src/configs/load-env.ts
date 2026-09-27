import { config } from '@dotenvx/dotenvx';

/**
 * Load environment variables from .env.development and .env with overload and error suppression.
 */
config({
  path: ['.env.development', '.env'],
  overload: true,
  ignore: ['MISSING_ENV_FILE'],
});
