import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

const completionArgs = {
  temperature: 0.7,
  maxTokens: 900,
  topP: 1,
};

const tools: never[] = [];

const DEFAULT_JOB_TITLE = 'Customer Success Manager';

export type InterviewQuestionsResult = {
  jobTitle: string;
  questions: string[];
};

function extractAssistantText(response: { outputs?: unknown[] }): string {
  if (!Array.isArray(response.outputs)) {
    return '';
  }

  for (const output of response.outputs) {
    if (!output || typeof output !== 'object') {
      continue;
    }

    const outputEntry = output as {
      type?: string;
      content?: string | Array<{ type?: string; text?: string }>;
    };

    if (outputEntry.type !== 'message.output' || outputEntry.content == null) {
      continue;
    }

    if (typeof outputEntry.content === 'string') {
      return outputEntry.content;
    }

    const textParts = outputEntry.content
      .filter(
        (chunk) => chunk && typeof chunk === 'object' && chunk.type === 'text',
      )
      .map((chunk) => String(chunk.text ?? '').trim())
      .filter(Boolean);

    if (textParts.length > 0) {
      return textParts.join('\n');
    }
  }

  return '';
}

function normalizeJobTitle(jobTitle: string): string {
  const trimmed = jobTitle.trim();
  return trimmed || DEFAULT_JOB_TITLE;
}

async function mistralChat(
  jobTitle: string,
): Promise<InterviewQuestionsResult> {
  const normalizedJobTitle = normalizeJobTitle(jobTitle);

  const instructions = [
    'You are an interview coach for generic job titles.',
    `Use this title as the role focus: "${normalizedJobTitle}".`,
    `If the title is empty or not generic, use "${DEFAULT_JOB_TITLE}" instead.`,
    'Return exactly 3 thoughtful interview questions for that role.',
    'Keep each question concise and specific to daily responsibilities of the role.',
    'Do not add explanations, headers, or extra commentary.',
    'Output must be valid JSON in this exact shape: ["question 1", "question 2", "question 3"].',
  ].join(' ');

  const messages = [
    {
      role: 'user' as const,
      content: `Generate interview questions for the role: ${normalizedJobTitle}`,
    },
  ];

  const response = await client.beta.conversations.start({
    inputs: messages as any,
    model: 'mistral-medium-latest',
    instructions,
    completionArgs,
    tools,
  });

  const rawContent = extractAssistantText(response as { outputs?: unknown[] });

  const parsedQuestions = rawContent ? JSON.parse(rawContent) : [];
  const questions =
    parsedQuestions.length === 3
      ? parsedQuestions
      : [
          `What does success in the first 90 days look like for a ${normalizedJobTitle}?`,
          `How would you prioritize your work when multiple stakeholders need support at the same time in a ${normalizedJobTitle} role?`,
          `Can you describe a situation where you improved a process or outcome relevant to a ${normalizedJobTitle} position?`,
        ];

  console.log(questions);

  return {
    jobTitle: normalizedJobTitle,
    questions,
  };
}

export default mistralChat;
