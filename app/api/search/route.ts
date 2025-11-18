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
    const { query, intentFilter } = body; // intentFilter: 'cofounder', 'teammate', 'client', etc.

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

    // Get blocked users (both directions)
    const blockedUsers = await prisma.blockedUser.findMany({
      where: {
        OR: [
          { blockerId: user.id },
          { blockedId: user.id },
        ],
      },
      select: {
        blockerId: true,
        blockedId: true,
      },
    });

    const blockedUserIds = blockedUsers.map((block) =>
      block.blockerId === user.id ? block.blockedId : block.blockerId
    );

    // Get all existing connections
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

    // Combine excluded user IDs
    const excludedUserIds = [...new Set([...connectedUserIds, ...blockedUserIds])];

    // Build search filters
    const searchFilters: any = {
      userId: {
        not: user.id,
        notIn: excludedUserIds,
      },
      searchable: true,
      profileVisibility: {
        in: ['PUBLIC'], // Only search public profiles
      },
    };

    // Add intent filter if provided
    if (intentFilter) {
      searchFilters.intent = intentFilter;
    }

    const profiles = await prisma.profile.findMany({
      where: searchFilters,
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
          user: {
            ...profile?.user,
            email: profile?.showEmail ? profile?.user.email : undefined,
          },
          profile: {
            motivations: profile?.motivations,
            goals: profile?.goals,
            skills: profile?.skills,
            experience: profile?.experience,
            workingStyle: profile?.workingStyle,
            intent: profile?.intent,
            aiGeneratedProfile: profile?.aiGeneratedProfile,
            availability: profile?.availability,
            timezone: profile?.timezone,
            interests: profile?.interests,
            links: profile?.showLinks ? profile?.links : [],
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
