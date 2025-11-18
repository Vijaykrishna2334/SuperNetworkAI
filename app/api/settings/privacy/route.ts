import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Update privacy settings
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profileVisibility, searchable, showEmail, showLinks } = body;

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...(profileVisibility && { profileVisibility }),
        ...(searchable !== undefined && { searchable }),
        ...(showEmail !== undefined && { showEmail }),
        ...(showLinks !== undefined && { showLinks }),
      },
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
