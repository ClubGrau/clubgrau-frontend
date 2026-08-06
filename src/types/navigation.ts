export interface NavigatePathsProps {
  id: number;
  router: string;
  icon: string;
  description: string;
  content: string;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigatePathsProps[];
}
