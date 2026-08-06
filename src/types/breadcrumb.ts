export interface BreadcrumbItem {
  id: string | number;
  label: string;
  /** When provided, the crumb becomes a navigable link. */
  to?: string;
}
