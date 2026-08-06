import type { Account } from "../../../types/account"

export interface AuthApi {
  login(input: Account.ToLogin): Promise<Account.LoginResponse>
}
