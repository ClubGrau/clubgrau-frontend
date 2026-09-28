import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { t } from '../i18n'
import { toApiError } from '../domain/api-error'
import { emailIssue, type EmailIssue } from '../domain/email-value'
import type { AuthApi } from '../services/api/auth/types'
import type { Account } from '../types/account'
import { useAuthStore } from '../stores/auth'
import { useToast } from './useToast'

export type LoginFieldIssue =
  | { field: 'email'; issue: EmailIssue }
  | { field: 'password'; issue: 'empty' }

const BAD_REQUEST_MESSAGES: Record<string, string> = {
  'Missing param email': 'Login.toast.emailRequired',
  'Missing param password': 'Login.toast.passwordRequired',
}

/** Client issues that block the login request. Password is only "empty" here. */
export function loginFieldIssues(data: Omit<Account.ToLogin, 'remember'>): LoginFieldIssue[] {
  const { email, password } = data
  const issues: LoginFieldIssue[] = []
  const emailProblem = emailIssue(email)

  if (emailProblem) issues.push({ field: 'email', issue: emailProblem })
  if (!password.trim()) issues.push({ field: 'password', issue: 'empty' })
  return issues
}

export function toastKeyForLoginFieldIssue(issue: LoginFieldIssue): string {
  if (issue.field === 'email') {
    return issue.issue === 'empty'
      ? 'Login.toast.emailRequired'
      : 'Login.toast.emailInvalid'
  }
  return 'Login.toast.passwordRequired'
}

/**
 * 401 is unknown email, wrong password, or an account that cannot log in.
 * All of those share one copy so the toast never says the password is wrong.
 */
export function toastKeyForLoginError(error: unknown): string {
  const mapped = toApiError(error)

  if (mapped.code === 'UNAUTHORIZED') return 'Login.toast.credentials'
  if (mapped.code === 'BAD_REQUEST')
    return BAD_REQUEST_MESSAGES[mapped.message] ?? 'Login.toast.credentials'

  return 'Login.toast.unexpected'
}

export function useLogin(authApi: AuthApi) {
  const authStore = useAuthStore()
  const router = useRouter()
  const toast = useToast()
  const userCredentials = reactive<Account.ToLogin>({
    email: '',
    password: '',
    remember: false,
  })

  const loginMutation = useMutation({
    mutationFn: (input: Account.ToLogin) => authApi.login(input),
    retry: 0,
    onSuccess: (data) => {
      authStore.setSession(data)
      void router.push('/app')
    },
    onError: (error) => {
      toast.push('error', t(toastKeyForLoginError(error)))
    },
  })

  function handleSubmit() {
    if (loginMutation.isPending.value) return

    const issues = loginFieldIssues({
      email: userCredentials.email.trim(),
      password: userCredentials.password,
    })
    if (issues.length > 0) {
      for (const issue of issues) {
        toast.push('error', t(toastKeyForLoginFieldIssue(issue)))
      }
      return
    }

    loginMutation.mutate({
      email: userCredentials.email.trim(),
      password: userCredentials.password,
      remember: userCredentials.remember,
    })
  }

  return {
    userCredentials,
    handleSubmit,
    isSubmitting: loginMutation.isPending,
  }
}
