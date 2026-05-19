import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

const messages = [
  {
    role: 'user' as const,
    content: 'Hello!',
  },
];

const completionArgs = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
};

const tools: never[] = [];

async function mistralChat() {
  const response = await client.beta.conversations.start({
    inputs: messages as any,
    model: 'mistral-medium-latest',
    instructions: ``,
    completionArgs,
    tools,
  });
  console.log(response);
  return response;
}

export default mistralChat;
