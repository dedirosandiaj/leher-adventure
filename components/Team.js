import { prisma } from '@/lib/prisma';
import TeamClient from './TeamClient';

export default async function Team() {
  const team = await prisma.teamMember.findMany();

  return <TeamClient team={team} />;
}
