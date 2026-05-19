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
  } catch {
    return data<ActionResult>(
      {
        error:
          'Unable to generate interview questions right now. Please try again.',
      },
      { status: 500 },
    );
  }
}

export default function Home() {
  return <Welcome />;
}
