import cuid, { slug } from 'cuid';

export const generateCuid = (): string => {
  return cuid();
};

export const generateSlug = (): string => {
  return slug();
};

