import type { Route } from './+types/home';
import { data } from 'react-router';
import { Welcome } from '../welcome/welcome';
import mistralChat from '../config/mistralai';

type ActionResult = {
  error?: string;
  jobTitle?: string;
  questions?: string[];
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Job Interview' },
    { name: 'interview', content: 'Give your best interview questions' },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawJobTitle = String(formData.get('jobTitle') ?? '').trim();

  if (!rawJobTitle) {
    return data<ActionResult>(
      { error: 'Please enter a job title. Try Customer Success Manager.' },
      { status: 400 },
    );
  }

  try {
    const result = await mistralChat(rawJobTitle);
    return data<ActionResult>({
      jobTitle: result.jobTitle,
      questions: result.questions,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to generate interview questions right now. Please try again.';

    if (message.includes('MISTRAL_API_KEY')) {
      return data<ActionResult>(
        {
          error:
            'Server configuration error: MISTRAL_API_KEY is missing. Add it in .env.local and restart the dev server.',
        },
        { status: 500 },
      );
    }

    return data<ActionResult>(
      {
        error:
          'Unable to generate interview questions right now. The AI response may be invalid or the API request failed.',
      },
      { status: 500 },
    );
  }
}

export default function Home() {
  return <Welcome />;
}
