import type { Route } from './+types/home';

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Home | Amazing Shop' }];
}

export default function Home() {
  return <h1>Welcome to React Router!</h1>;
}
