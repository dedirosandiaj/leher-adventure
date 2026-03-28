import { getHeroText } from './actions';
import HeroTextForm from './HeroTextForm';

export default async function HeroTextPage() {
  const heroText = await getHeroText();
  return <HeroTextForm heroText={heroText} />;
}
