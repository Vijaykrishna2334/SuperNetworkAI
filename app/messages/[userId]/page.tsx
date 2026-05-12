import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MessagingClient from '@/components/MessagingClient';

export default async function Messages({ params }: { params: { userId: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Check if users are connected
  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId: user.id, receiverId: params.userId, status: 'ACCEPTED' },
        { senderId: params.userId, receiverId: user.id, status: 'ACCEPTED' },
      ],
    },
  });

  if (!connection) {
    redirect('/dashboard');
  }

  // Get other user info
  const otherUser = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!otherUser) {
    redirect('/dashboard');
  }

  // Get messages
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: params.userId },
        { senderId: params.userId, receiverId: user.id },
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
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      senderId: params.userId,
      receiverId: user.id,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return (
    <MessagingClient
      currentUser={user}
      otherUser={otherUser}
      initialMessages={messages}
    />
  );
}
