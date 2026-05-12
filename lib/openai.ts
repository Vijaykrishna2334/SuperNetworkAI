import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

export interface ProfileGenerationInput {
  motivations: string;
  goals: string;
  skills: string[];
  experience: string;
  workingStyle: string;
  intent: string;
  links: string[];
}

export async function generateMatchmakingProfile(input: ProfileGenerationInput): Promise<string> {
  const prompt = `You are an expert matchmaking profile writer. Based on the following information about a founder/builder, create a compelling, authentic matchmaking profile that highlights their strengths, goals, and what they're looking for in collaborators.

Motivations: ${input.motivations}
Goals: ${input.goals}
Skills: ${input.skills.join(', ')}
Experience: ${input.experience}
Working Style: ${input.workingStyle}
Looking for: ${input.intent}
Links: ${input.links.join(', ')}

Write a concise 2-3 paragraph profile that:
1. Captures their unique perspective and motivations
2. Highlights their skills and experience naturally
3. Explains what they're looking for and why
4. Uses an authentic, professional but friendly tone
5. Avoids clichés and generic statements

Profile:`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert at creating compelling, authentic matchmaking profiles for founders and builders.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || '';
}

export interface SearchQuery {
  query: string;
  currentUserId: string;
}

export interface MatchResult {
  userId: string;
  score: number;
  explanation: string;
}

export async function rankMatches(
  query: string,
  profiles: Array<{ userId: string; profile: any; user: any }>,
  currentUserProfile: any
): Promise<MatchResult[]> {
  const prompt = `You are an expert matchmaking AI. A user is searching for: "${query}"

Current user's profile:
- Motivations: ${currentUserProfile.motivations}
- Goals: ${currentUserProfile.goals}
- Skills: ${currentUserProfile.skills.join(', ')}
- Looking for: ${currentUserProfile.intent}

Here are potential matches (JSON array):
${JSON.stringify(
  profiles.map((p) => ({
    userId: p.userId,
    name: p.user.name,
    motivations: p.profile.motivations,
    goals: p.profile.goals,
    skills: p.profile.skills,
    intent: p.profile.intent,
    experience: p.profile.experience,
    workingStyle: p.profile.workingStyle,
  })),
  null,
  2
)}

Rank these matches and provide a relevance score (0-100) and explanation for each. Consider:
1. Complementary skills and shared interests
2. Alignment with search query
3. Compatible goals and motivations
4. Working style compatibility
5. Mutual value proposition

Return ONLY a JSON array of objects with this exact structure:
[
  {
    "userId": "user_id_here",
    "score": 85,
    "explanation": "Brief explanation of why this is a strong match"
  }
]

Ensure valid JSON format. No additional text.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a matchmaking AI that returns only valid JSON arrays.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content || '[]';

  try {
    const results = JSON.parse(content);
    return results.sort((a: MatchResult, b: MatchResult) => b.score - a.score);
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    return [];
  }
}
