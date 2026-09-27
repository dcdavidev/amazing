import { describe, expect, it } from 'vitest';

import { isDatabaseUrlSet } from '../../src/lib/is-database-url-set.ts';

describe('isDatabaseUrlSet', () => {
  it('returns true when database URL is defined and non-empty', () => {
    expect(isDatabaseUrlSet()).toBe(true);
  });
});
