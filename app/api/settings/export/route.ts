import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Export user data (GDPR compliance)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        sentConnections: {
          include: {
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        receivedConnections: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        sentMessages: {
          include: {
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        receivedMessages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        blockedUsers: {
          include: {
            blocked: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Remove sensitive fields
    const exportData = {
      ...userData,
      password: undefined,
    };

    return NextResponse.json(exportData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="supernetwork-data-${user.id}.json"`,
      },
    });
  } catch (error) {
    console.error('Export data error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
