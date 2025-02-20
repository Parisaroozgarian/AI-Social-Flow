import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class ContentGenerationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ContentGenerationError';
  }
}

type ContentSuggestion = {
  content: string;
  hashtags: string[];
  engagement_prediction: number;
  tone: string;
  quality_metrics: {
    clarity: number;
    relevance: number;
    originality: number;
    engagement_potential: number;
  };
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      if (i === retries - 1) throw error;

      const isRateLimitError = error.status === 429 || 
                              (error.error?.type === 'rate_limit_exceeded');

      if (!isRateLimitError) throw error;

      await delay(RETRY_DELAY * Math.pow(2, i));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function generateSocialContent(prompt: string, platform: string): Promise<ContentSuggestion> {
  try {
    const platformGuidelines = getPlatformGuidelines(platform);
    const enhancedPrompt = `Generate highly engaging ${platform} content optimized for maximum impact and authenticity. 

Platform-specific considerations:
${platformGuidelines}

Original prompt: ${prompt}

Additional requirements:
- Ensure the content is authentic, engaging, and platform-appropriate
- Include trending but relevant hashtags
- Maintain brand voice consistency
- Focus on creating shareable, valuable content

Return response in JSON format with the following structure:
{
  "content": "the generated post text",
  "hashtags": ["relevant", "trending", "hashtags"],
  "engagement_prediction": number between 0-100,
  "tone": "descriptive tone of the content",
  "quality_metrics": {
    "clarity": number between 0-100,
    "relevance": number between 0-100,
    "originality": number between 0-100,
    "engagement_potential": number between 0-100
  }
}`;

    const response = await retryWithExponentialBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert ${platform} content strategist with deep understanding of the platform's best practices, audience behavior, and content performance metrics. Your goal is to create highly engaging, platform-optimized content that drives meaningful engagement while maintaining authenticity and brand voice.`
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        response_format: { type: "json_object" }
      });
    });

    if (!response.choices[0].message.content) {
      throw new ContentGenerationError(
        'No content generated from OpenAI',
        'EMPTY_RESPONSE'
      );
    }

    const parsedResponse = JSON.parse(response.choices[0].message.content);

    // Validate and normalize the response
    const normalizedResponse: ContentSuggestion = {
      content: validateString(parsedResponse.content, 'content'),
      hashtags: validateHashtags(parsedResponse.hashtags),
      engagement_prediction: validateNumber(parsedResponse.engagement_prediction, 'engagement_prediction', 0, 100),
      tone: validateString(parsedResponse.tone, 'tone'),
      quality_metrics: {
        clarity: validateNumber(parsedResponse.quality_metrics?.clarity, 'clarity', 0, 100),
        relevance: validateNumber(parsedResponse.quality_metrics?.relevance, 'relevance', 0, 100),
        originality: validateNumber(parsedResponse.quality_metrics?.originality, 'originality', 0, 100),
        engagement_potential: validateNumber(parsedResponse.quality_metrics?.engagement_potential, 'engagement_potential', 0, 100)
      }
    };

    return normalizedResponse;
  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    if (error instanceof ContentGenerationError) {
      throw error;
    }

    const errorCode = error.status === 429 ? 'RATE_LIMIT' :
                     error.status === 401 ? 'AUTH_ERROR' :
                     'API_ERROR';

    throw new ContentGenerationError(
      `Failed to generate content: ${error.message}`,
      errorCode
    );
  }
}

function getPlatformGuidelines(platform: string): string {
  const guidelines: Record<string, string> = {
    twitter: `- Keep content concise and impactful within character limits
- Use 1-2 relevant hashtags maximum
- Focus on timely, conversational content
- Consider thread potential for longer messages`,

    instagram: `- Create visually descriptive content
- Use 5-10 strategic hashtags
- Focus on storytelling elements
- Include calls to action
- Consider carousel potential`,

    linkedin: `- Maintain professional tone
- Focus on industry insights and expertise
- Use 3-5 relevant hashtags
- Include data points when applicable
- Consider longer-form content`,

    facebook: `- Focus on community engagement
- Keep content conversational but informative
- Use 1-3 hashtags maximum
- Include questions or calls for interaction
- Consider multimedia potential`
  };

  return guidelines[platform.toLowerCase()] || 
    'Focus on platform-appropriate content length, tone, and engagement strategies';
}

function validateString(value: any, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ContentGenerationError(
      `Invalid ${field}: must be a non-empty string`,
      'VALIDATION_ERROR'
    );
  }
  return value.trim();
}

function validateHashtags(hashtags: any): string[] {
  if (!Array.isArray(hashtags)) {
    throw new ContentGenerationError(
      'Invalid hashtags: must be an array',
      'VALIDATION_ERROR'
    );
  }
  return hashtags.map(tag => {
    if (typeof tag !== 'string' || !tag.trim()) {
      throw new ContentGenerationError(
        'Invalid hashtag: each hashtag must be a non-empty string',
        'VALIDATION_ERROR'
      );
    }
    return tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`;
  });
}

function validateNumber(value: any, field: string, min: number, max: number): number {
  const num = Number(value);
  if (isNaN(num) || num < min || num > max) {
    throw new ContentGenerationError(
      `Invalid ${field}: must be a number between ${min} and ${max}`,
      'VALIDATION_ERROR'
    );
  }
  return num;
}