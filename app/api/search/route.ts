import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { rankMatches } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Get current user's profile
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      );
    }

    // Get all other users with profiles (excluding current user and already connected)
    const existingConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const connectedUserIds = existingConnections.map((conn) =>
      conn.senderId === user.id ? conn.receiverId : conn.senderId
    );

    const profiles = await prisma.profile.findMany({
      where: {
        userId: {
          not: user.id,
          notIn: connectedUserIds,
        },
        searchable: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      take: 50, // Limit to 50 profiles for performance
    });

    if (profiles.length === 0) {
      return NextResponse.json(
        {
          matches: [],
          message: 'No matches found. Try broadening your search.',
        },
        { status: 200 }
      );
    }

    // Use AI to rank matches
    const rankedMatches = await rankMatches(
      query,
      profiles.map((p) => ({
        userId: p.userId,
        profile: p,
        user: p.user,
      })),
      currentUserProfile
    );

    // Enrich with full profile data
    const enrichedMatches = rankedMatches
      .filter((match) => match.score > 50) // Only show matches with score > 50
      .map((match) => {
        const profile = profiles.find((p) => p.userId === match.userId);
        return {
          ...match,
          user: profile?.user,
          profile: {
            motivations: profile?.motivations,
            goals: profile?.goals,
            skills: profile?.skills,
            experience: profile?.experience,
            workingStyle: profile?.workingStyle,
            intent: profile?.intent,
            aiGeneratedProfile: profile?.aiGeneratedProfile,
          },
        };
      })
      .slice(0, 10); // Return top 10 matches

    return NextResponse.json({ matches: enrichedMatches }, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
