import { getAbout } from './actions';
import AboutForm from './AboutForm';

export default async function AboutAdminPage() {
  const about = await getAbout();
  return <AboutForm about={about} />;
}
