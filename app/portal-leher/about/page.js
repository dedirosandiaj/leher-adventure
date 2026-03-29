import { getAbout } from './actions';
import AboutForm from './AboutForm';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutAdminPage() {
  unstable_noStore();
  const about = await getAbout();
  return <AboutForm about={about} />;
}
