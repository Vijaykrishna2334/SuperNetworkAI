import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SettingsClient from '@/components/SettingsClient';

export default async function Settings() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    redirect('/onboarding');
  }

  const blockedUsers = await prisma.blockedUser.findMany({
    where: { blockerId: user.id },
    include: {
      blocked: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return <SettingsClient user={user} profile={profile} blockedUsers={blockedUsers} />;
}
