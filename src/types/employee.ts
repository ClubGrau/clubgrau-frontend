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
    username?: string;
    email: string;
    role: string;
    password: string;
    passwordConfirmation: string;
    phone: string;
    nif?: string;
    status: EmployeeStatus;
    gender?: string;
    address?: string;
    languages?: string;
    emergencyContact?: string;
    employmentId?: string;
    jobTitle?: string;
  }

  /** PATCH /api/employee/:id/main-data — Dados principais. */
  export interface UpdateMainDataCommand {
    id: string;
    name: string;
    email: string;
    phone: string;
    /** Empty string clears username on the server. */
    username: string;
  }

  /** PATCH /api/employee/:id/personal-data — Informações pessoais. */
  export interface UpdatePersonalDataCommand {
    id: string;
    /** `null` clears gender. The API accepts only `male`, `female`, or `other`. */
    gender?: string | null;
    languages?: string;
    emergencyContact?: string;
    nif?: string;
    address?: string;
  }

  /** PATCH /api/employee/:id/professional-data — Informações profissionais. */
  export interface UpdateProfessionalDataCommand {
    id: string;
    role: string;
    jobTitle?: string;
    employmentId?: string;
    /** ACTIVE, VACATION ou INACTIVE. REMOVED não entra neste comando. */
    status: EmployeeStatus;
  }
}
