import { describe, expect, it } from 'vitest';
import { PERSON } from '../../src/data/person';

describe('structured data', () => {
  it('names the author and links the GitHub and LinkedIn profiles once each', () => {
    expect(PERSON.name).toBe('Lorenzo Tripodi');
    expect(PERSON.sameAs).toHaveLength(2);
    expect(PERSON.sameAs.some((href) => href.startsWith('https://github.com/'))).toBe(true);
    expect(PERSON.sameAs.some((href) => /^https:\/\/(www\.)?linkedin\.com\//.test(href))).toBe(true);
  });
});
