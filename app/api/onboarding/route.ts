import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateMatchmakingProfile } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      motivations,
      goals,
      skills,
      experience,
      workingStyle,
      intent,
      links,
      availability,
      timezone,
      interests,
    } = body;

    // Validate required fields
    if (!motivations || !goals || !skills || !intent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate AI profile
    const aiGeneratedProfile = await generateMatchmakingProfile({
      motivations,
      goals,
      skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()),
      experience: experience || '',
      workingStyle: workingStyle || '',
      intent,
      links: Array.isArray(links) ? links : (links ? links.split(',').map((l: string) => l.trim()) : []),
    });

    // Create or update profile
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        motivations,
        goals,
        skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()),
        experience: experience || '',
        workingStyle: workingStyle || '',
        intent,
        links: Array.isArray(links) ? links : (links ? links.split(',').map((l: string) => l.trim()) : []),
        availability: availability || null,
        timezone: timezone || null,
        interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map((i: string) => i.trim()) : []),
        aiGeneratedProfile,
        lastAiUpdate: new Date(),
      },
      create: {
        userId: user.id,
        motivations,
        goals,
        skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()),
        experience: experience || '',
        workingStyle: workingStyle || '',
        intent,
        links: Array.isArray(links) ? links : (links ? links.split(',').map((l: string) => l.trim()) : []),
        availability: availability || null,
        timezone: timezone || null,
        interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map((i: string) => i.trim()) : []),
        aiGeneratedProfile,
        lastAiUpdate: new Date(),
      },
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { aiGeneratedProfile } = body;

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        aiGeneratedProfile,
        profileEdited: true,
      },
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
