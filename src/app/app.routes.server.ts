import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'search',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'movie/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'actor/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

export async function getPrerenderParams(route: string): Promise<string[]> {
  // For dynamic routes, we could return popular movie/actor IDs
  // For now, return empty array to avoid SSR issues
  return [];
}
