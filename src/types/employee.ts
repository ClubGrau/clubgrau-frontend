export type EmployeeStatus = 'ACTIVE' | 'VACATION' | 'INACTIVE';

export namespace Employee {
  /** Espelho do payload que GET /api/employees retorna. */
  export interface Entity {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    status: EmployeeStatus;
    createdAt: string;
    deactivateAt?: string;
    phone?: string;
    nif?: string;
    gender?: string;
    address?: string;
    languages?: string;
    emergencyContact?: string;
    employmentId?: string;
    jobTitle?: string;
  }

  /** Linha de tabela / painel de detalhe: Entity + campo computado. */
  export type ListItem = Entity & { initials: string };

  /** Payload do formulário de criação — único lugar onde senha existe. */
  export interface CreateCommand {
    name: string;
    username: string;
    email: string;
    role: string;
    password: string;
    passwordConfirmation: string;
    phone?: string;
    nif?: string;
    status?: EmployeeStatus;
    gender?: string;
    address?: string;
    languages?: string;
    emergencyContact?: string;
    employmentId?: string;
    jobTitle?: string;
  }
}
