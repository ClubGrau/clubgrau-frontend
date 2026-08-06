import { api } from "../config";
import type { AuthApi } from "./types";
import type { Account } from "../../../types/account";

export class HttpAuthApi implements AuthApi {
  async login(input: Account.ToLogin): Promise<Account.LoginResponse> {
    const { data } = await api.post('/auth', input)
    console.log(data, 'data from http')
    return { token: data.token }
  }
}

export const httpAuthApi = new HttpAuthApi()
