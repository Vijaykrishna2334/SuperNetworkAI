import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseCVWithAI } from '@/lib/cv-parser';

// Upload and parse CV
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('cv') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported. Please upload PDF, DOC, DOCX, or TXT' },
        { status: 400 }
      );
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = buffer.toString('utf-8');

    // Parse CV with AI
    const parsedData = await parseCVWithAI(text);

    // Store CV data in profile
    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        cvParsedData: JSON.stringify(parsedData),
        // Auto-update profile fields if they're empty
        ...(parsedData.skills &&
          parsedData.skills.length > 0 && {
            skills: parsedData.skills,
          }),
        ...(parsedData.experience && { experience: parsedData.experience }),
        ...(parsedData.links &&
          parsedData.links.length > 0 && {
            links: parsedData.links,
          }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        parsedData,
        message: 'CV uploaded and parsed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process CV' },
      { status: 500 }
    );
  }
}
