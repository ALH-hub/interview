import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const DEFAULT_JOB_TITLE = 'Customer Success Manager';

const completionArgs = {
  temperature: 0.7,
  maxTokens: 900,
  topP: 1,
};

const tools: never[] = [];

export type InterviewQuestionsResult = {
  jobTitle: string;
  questions: string[];
};

function normalizeJobTitle(jobTitle: string): string {
  const trimmed = jobTitle.trim();
  return trimmed || DEFAULT_JOB_TITLE;
}

function getClient(): Mistral {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error('Missing MISTRAL_API_KEY. Add it to .env.local.');
  }

  return new Mistral({ apiKey });
}

function buildPrompt(jobTitle: string): string {
  return [
    `Create interview questions for a ${jobTitle} role.`,
    'Return exactly 3 thoughtful interview questions.',
    'Keep them concise and generic.',
    'Return only valid JSON as an array of 3 strings.',
  ].join(' ');
}

function fallbackQuestions(jobTitle: string): string[] {
  return [
    `What does success in the first 90 days look like for a ${jobTitle}?`,
    `How do you prioritize work when several stakeholders need help at once in a ${jobTitle} role?`,
    `Can you share an example of improving a process or outcome in a ${jobTitle} position?`,
  ];
}

export default async function mistralChat(
  jobTitle: string,
): Promise<InterviewQuestionsResult> {
  const normalizedJobTitle = normalizeJobTitle(jobTitle);
  const client = getClient();

  new Promise((resolve) => setTimeout(resolve, 100));

  const response = await client.beta.conversations.start({
    inputs: [
      {
        role: 'user' as const,
        content: buildPrompt(normalizedJobTitle),
      },
    ] as any,
    model: 'mistral-medium-latest',
    instructions: 'Return exactly 3 concise interview questions as JSON.',
    completionArgs,
    tools,
  });

  const output = response.outputs?.find(
    (item) =>
      item &&
      typeof item === 'object' &&
      (item as { type?: string }).type === 'message.output',
  ) as
    | { content?: string | Array<{ type?: string; text?: string }> }
    | undefined;

  const rawText =
    typeof output?.content === 'string'
      ? output.content
      : Array.isArray(output?.content)
        ? output.content
            .filter((chunk) => chunk?.type === 'text')
            .map((chunk) => chunk.text?.trim() ?? '')
            .filter(Boolean)
            .join('\n')
        : '';

  const cleanedText = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/, '')
    .trim();

  let questions: string[] = [];

  try {
    const parsed = JSON.parse(cleanedText);
    if (Array.isArray(parsed)) {
      questions = parsed
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 3);
    }
  } catch {
    questions = cleanedText
      .split('\n')
      .map((line) =>
        line
          .trim()
          .replace(/^\d+[.)]\s*/, '')
          .replace(/^[-*]\s*/, ''),
      )
      .filter(Boolean)
      .slice(0, 3);
  }

  return {
    jobTitle: normalizedJobTitle,
    questions:
      questions.length === 3
        ? questions
        : fallbackQuestions(normalizedJobTitle),
  };
}
