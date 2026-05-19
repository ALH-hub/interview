import type { Route } from './+types/home';
import { Welcome } from '../welcome/welcome';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Job Interview' },
    { name: 'interview', content: 'Give your best interview questions' },
  ];
}

export default function Home() {
  return <Welcome />;
}
