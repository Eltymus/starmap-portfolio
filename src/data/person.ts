import { CHAPTERS } from './chapters';

const PROFILE_LINK = /^https:\/\/(www\.)?(github|linkedin)\.com\//;

/** Who the site is about, for structured data (JSON-LD). Name and profiles come from the chapters. */
export const PERSON = {
  name: CHAPTERS[0].sheet.title,
  jobTitle: 'Software Developer',
  city: 'Turin',
  countryCode: 'IT',
  sameAs: [
    ...new Set(
      CHAPTERS.flatMap((chapter) => chapter.sheet.links ?? [])
        .map(([, href]) => href)
        .filter((href) => PROFILE_LINK.test(href))
    )
  ]
} as const;
