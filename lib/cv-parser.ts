import openai from './openai';

export interface ParsedCVData {
  skills: string[];
  experience: string;
  links: string[];
  summary?: string;
  interests?: string[];
}

export async function parseCVWithAI(cvText: string): Promise<ParsedCVData> {
  const prompt = `Parse the following resume/CV and extract structured information. Return ONLY a JSON object with this exact structure:

{
  "skills": ["skill1", "skill2", ...],
  "experience": "brief summary of work experience",
  "links": ["portfolio.com", "linkedin.com/in/...", ...],
  "summary": "1-2 sentence professional summary",
  "interests": ["interest1", "interest2", ...]
}

Resume/CV text:
${cvText.substring(0, 10000)}

Return only valid JSON, no additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert CV parser. Extract structured data from resumes and return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);

    return {
      skills: parsed.skills || [],
      experience: parsed.experience || '',
      links: parsed.links || [],
      summary: parsed.summary || '',
      interests: parsed.interests || [],
    };
  } catch (error) {
    console.error('CV parsing error:', error);
    // Return empty data if parsing fails
    return {
      skills: [],
      experience: '',
      links: [],
    };
  }
}
