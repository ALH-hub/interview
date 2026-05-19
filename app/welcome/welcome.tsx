import { Form, useActionData, useNavigation } from 'react-router';

type ActionResult = {
  error?: string;
  jobTitle?: string;
  questions?: string[];
};

export function Welcome() {
  const actionData = useActionData<ActionResult>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <main className='mx-auto mt-14 w-full max-w-3xl px-4 pb-12'>
      <section className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Interview Question Generator
        </h1>
        <p className='mt-2 text-sm text-gray-600'>
          Enter a generic job title and get 3 thoughtful interview questions.
          Example: Customer Success Manager.
        </p>

        <Form method='post' className='mt-6 space-y-4'>
          <div>
            <label
              htmlFor='jobTitle'
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Job title
            </label>
            <input
              id='jobTitle'
              name='jobTitle'
              type='text'
              placeholder='Customer Success Manager'
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-blue-500 transition focus:ring-2'
            />
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'
          >
            {isSubmitting ? 'Generating...' : 'Generate Questions'}
          </button>
        </Form>

        {actionData?.error && (
          <p className='mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
            {actionData.error}
          </p>
        )}

        {actionData?.questions && actionData.questions.length > 0 && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Suggested questions for {actionData.jobTitle}
            </h2>
            <ol className='mt-3 list-decimal space-y-2 pl-5 text-gray-800'>
              {actionData.questions.map((question, index) => (
                <li key={`${question}-${index}`}>{question}</li>
              ))}
            </ol>
          </section>
        )}
      </section>
    </main>
  );
}
