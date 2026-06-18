import 'server-only';
import { cookies } from 'next/headers';

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  th: () => import('@/dictionaries/th.json').then((module) => module.default),
};

export const getDictionary = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'th';
  const lang = locale === 'th' ? 'th' : 'en';
  return dictionaries[lang]();
};

export const getLocale = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('NEXT_LOCALE')?.value || 'th';
};
