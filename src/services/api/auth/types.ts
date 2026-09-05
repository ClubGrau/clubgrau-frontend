import type { Account } from "../../../types/account"

export interface AuthApi {
  login(input: Account.ToLogin): Promise<Account.LoginResponse>
}

export interface RequestPasswordResetParams {
  email: string
}

export interface RequestPasswordResetApi {
  requestReset(params: RequestPasswordResetParams): Promise<void>
}
