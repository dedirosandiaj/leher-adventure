import { prisma } from '@/lib/prisma';
import CrudTeam from './CrudTeam';

export default async function TeamAdminPage() {
  const members = await prisma.teamMember.findMany({ orderBy: { order: 'asc' } });
  return <CrudTeam members={members} />;
}
