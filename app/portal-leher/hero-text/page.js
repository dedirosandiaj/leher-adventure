import { getHeroText } from './actions';
import HeroTextForm from './HeroTextForm';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HeroTextPage() {
  unstable_noStore();
  const heroText = await getHeroText();
  return <HeroTextForm heroText={heroText} />;
}
