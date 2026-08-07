import type { Employee } from '../../types/employee';

type EmployeeBase = Pick<
  Employee,
  | 'id'
  | 'name'
  | 'username'
  | 'email'
  | 'phone'
  | 'nif'
  | 'permission'
  | 'status'
  | 'initials'
>;

const enrichEmployee = (
  base: EmployeeBase,
  extras: Partial<Omit<Employee, keyof EmployeeBase>> = {},
): Employee => ({
  department: 'Operações',
  dateHired: '17 Mar 2021',
  gender: 'Não informado',
  maritalStatus: 'Solteiro(a)',
  address: 'Lisboa, Portugal',
  languages: 'Português, Inglês',
  education: 'Licenciatura',
  emergencyContact: base.phone,
  emergencyContactRelation: 'Familiar',
  employmentId: `EMP-${String(base.id).padStart(4, '0')}`,
  employmentType: 'Tempo integral',
  jobTitle: base.permission,
  skills: ['Comunicação', 'Trabalho em equipa'],
  ...extras,
  ...base,
});

export const employeesMock: Employee[] = [
  enrichEmployee(
    {
      id: 1,
      name: 'Lucas Ferreira',
      username: 'lucasferreira',
      email: 'lucasferreia@gmail.com',
      phone: '+351 233-906-250',
      nif: '271216182',
      permission: 'Manager',
      status: 'ativo',
      initials: 'LF',
    },
    {
      department: 'Gestão',
      dateHired: '12 Jan 2020',
      gender: 'Masculino',
      maritalStatus: 'Casado(a)',
      address: 'Rua Augusta 120, Lisboa, Portugal',
      education: 'Mestrado em Gestão',
      jobTitle: 'Manager',
      skills: ['Liderança', 'Gestão de equipas', 'Planeamento', 'Negociação'],
    },
  ),
  enrichEmployee(
    {
      id: 2,
      name: 'Ana Sofia Mendes',
      username: 'anasmendes',
      email: 'ana.mendes@grausystem.pt',
      phone: '+351 912-445-780',
      nif: '234567891',
      permission: 'Operador',
      status: 'ativo',
      initials: 'AM',
    },
    {
      department: 'Atendimento',
      dateHired: '03 Mai 2022',
      gender: 'Feminino',
      address: 'Av. da Liberdade 45, Lisboa, Portugal',
      education: 'Licenciatura em Comunicação',
      jobTitle: 'Operadora',
      skills: ['Atendimento', 'Comunicação', 'CRM'],
    },
  ),
  enrichEmployee(
    {
      id: 3,
      name: 'Pedro Costa',
      username: 'pedrocosta',
      email: 'pedro.costa@grausystem.pt',
      phone: '+351 933-120-445',
      nif: '198765432',
      permission: 'Admin',
      status: 'ativo',
      initials: 'PC',
    },
    {
      department: 'Tecnologia',
      dateHired: '21 Set 2019',
      gender: 'Masculino',
      education: 'Licenciatura em Informática',
      jobTitle: 'Administrador',
      skills: ['Infraestrutura', 'Segurança', 'Suporte', 'Redes'],
    },
  ),
  enrichEmployee(
    {
      id: 4,
      name: 'Mariana Lopes',
      username: 'marianaslopes',
      email: 'mariana.lopes@grausystem.pt',
      phone: '+351 967-881-203',
      nif: '256789123',
      permission: 'Manager',
      status: 'ferias',
      initials: 'ML',
    },
    {
      department: 'Gestão',
      dateHired: '08 Fev 2021',
      gender: 'Feminino',
      maritalStatus: 'Solteiro(a)',
      address: 'Porto, Portugal',
      jobTitle: 'Manager',
      skills: ['Liderança', 'Comunicação', 'Organização'],
    },
  ),
  enrichEmployee({
    id: 5,
    name: 'João Ribeiro',
    username: 'joaoribeiro',
    email: 'joao.ribeiro@grausystem.pt',
    phone: '+351 924-556-019',
    nif: '212345678',
    permission: 'Operador',
    status: 'ativo',
    initials: 'JR',
  }),
  enrichEmployee(
    {
      id: 6,
      name: 'Beatriz Nunes',
      username: 'beatriznunes',
      email: 'beatriz.nunes@grausystem.pt',
      phone: '+351 918-334-672',
      nif: '267891234',
      permission: 'Financeiro',
      status: 'ativo',
      initials: 'BN',
    },
    {
      department: 'Financeiro',
      dateHired: '15 Jul 2021',
      gender: 'Feminino',
      education: 'Licenciatura em Contabilidade',
      jobTitle: 'Analista financeira',
      skills: ['Contabilidade', 'Excel', 'Análise financeira'],
    },
  ),
  enrichEmployee({
    id: 7,
    name: 'Ricardo Almeida',
    username: 'ricardoalmeida',
    email: 'ricardo.almeida@grausystem.pt',
    phone: '+351 961-772-408',
    nif: '245678912',
    permission: 'Manager',
    status: 'ativo',
    initials: 'RA',
  }),
  enrichEmployee(
    {
      id: 8,
      name: 'Carla Teixeira',
      username: 'carlateixeira',
      email: 'carla.teixeira@grausystem.pt',
      phone: '+351 935-209-881',
      nif: '223456789',
      permission: 'Operador',
      status: 'inativo',
      initials: 'CT',
    },
    {
      department: 'Atendimento',
      gender: 'Feminino',
      jobTitle: 'Operadora',
    },
  ),
  enrichEmployee(
    {
      id: 9,
      name: 'Tiago Martins',
      username: 'tiagomartins',
      email: 'tiago.martins@grausystem.pt',
      phone: '+351 929-640-115',
      nif: '278901234',
      permission: 'Admin',
      status: 'ativo',
      initials: 'TM',
    },
    {
      department: 'Tecnologia',
      gender: 'Masculino',
      jobTitle: 'Administrador',
      skills: ['Sistemas', 'Cloud', 'Automação'],
    },
  ),
  enrichEmployee(
    {
      id: 10,
      name: 'Sofia Carvalho',
      username: 'sofiacarvalho',
      email: 'sofia.carvalho@grausystem.pt',
      phone: '+351 914-883-560',
      nif: '289012345',
      permission: 'Financeiro',
      status: 'ativo',
      initials: 'SC',
    },
    {
      department: 'Financeiro',
      gender: 'Feminino',
      dateHired: '29 Nov 2023',
      jobTitle: 'Analista financeira',
      skills: ['Tesouraria', 'Reporting', 'Excel'],
    },
  ),
];
