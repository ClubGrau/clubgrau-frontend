export namespace Account {
  export interface ToLogin {
    email: string;
    password: string;
    remember: boolean;
  }

  export interface LoginResponse {
    token: string;
  }
}
