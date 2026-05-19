import { createRequestHandler } from 'react-router';
// @ts-expect-error generated during `pnpm build`
import * as build from '../../build/server/index.js';

const handleRequest = createRequestHandler(build, process.env.NODE_ENV);

export async function handler(event: {
  httpMethod?: string;
  headers?: Record<string, string>;
  body?: string | null;
  isBase64Encoded?: boolean;
  rawUrl?: string;
  path?: string;
}) {
  const url = new URL(event.rawUrl ?? event.path ?? '/', 'http://localhost');
  const method = event.httpMethod ?? 'GET';
  const body =
    method === 'GET' || method === 'HEAD'
      ? undefined
      : event.body
        ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
        : undefined;

  const request = new Request(url, {
    method,
    headers: event.headers,
    body,
  });

  const response = await handleRequest(request);
  const responseBody = await response.text();

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: responseBody,
  };
}
