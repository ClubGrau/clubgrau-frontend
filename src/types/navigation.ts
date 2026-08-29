import type { ActorRole } from './actor';

export interface NavigatePathsProps {
  id: number;
  router: string;
  icon: string;
  description: string;
  content: string;
  roles?: ActorRole[];
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigatePathsProps[];
}
