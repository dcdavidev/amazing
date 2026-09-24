import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('articles/:id', 'routes/article.tsx'),
] satisfies RouteConfig;
