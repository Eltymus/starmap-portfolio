const BASE_URL = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';

export const assetUrl = (path: string): string => BASE_URL + path;

export const PORTRAIT_URL = assetUrl('img/portrait.webp');
