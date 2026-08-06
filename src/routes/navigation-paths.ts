import type { NavigationSection } from '../types/navigation';

export const navigationSections: NavigationSection[] = [
  {
    id: 'gestao',
    title: 'Gestão',
    items: [
      {
        id: 0,
        router: '/app/dashboard',
        icon: 'carbon:chart-combo-stacked',
        description: 'Visão Geral',
        content: 'Dashboard',
      },
      {
        id: 1,
        router: '/app/clients',
        icon: 'carbon:user-multiple',
        description: 'Clientes',
        content: 'Clientes',
      },
      {
        id: 2,
        router: '/app/employees',
        icon: 'clarity:employee-line',
        description: 'Colaboradores',
        content: 'Colaboradores',
      },
    ],
  },
  // Exemplo de futura etapa:
  // {
  //   id: 'operacoes',
  //   title: 'Operações',
  //   items: [],
  // },
];
