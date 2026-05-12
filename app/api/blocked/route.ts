import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Block a user
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { blockedUserId } = body;

    if (!blockedUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Can't block yourself
    if (blockedUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      );
    }

    // Check if already blocked
    const existingBlock = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId: blockedUserId,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json(
        { error: 'User already blocked' },
        { status: 400 }
      );
    }

    // Create block
    const block = await prisma.blockedUser.create({
      data: {
        blockerId: user.id,
        blockedId: blockedUserId,
      },
    });

    // Also delete any existing connections
    await prisma.connection.deleteMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: blockedUserId },
          { senderId: blockedUserId, receiverId: user.id },
        ],
      },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error('Block user error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Get blocked users
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blockedUsers = await prisma.blockedUser.findMany({
      where: { blockerId: user.id },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ blockedUsers }, { status: 200 });
  } catch (error) {
    console.error('Get blocked users error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
