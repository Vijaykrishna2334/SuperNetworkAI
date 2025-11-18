import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Check if user has completed onboarding
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    redirect('/onboarding');
  }

  // Get pending connection requests
  const pendingRequests = await prisma.connection.findMany({
    where: {
      receiverId: user.id,
      status: 'PENDING',
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  // Get accepted connections
  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { senderId: user.id, status: 'ACCEPTED' },
        { receiverId: user.id, status: 'ACCEPTED' },
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return (
    <DashboardClient
      user={user}
      profile={profile}
      pendingRequests={pendingRequests}
      connections={connections}
    />
  );
}
