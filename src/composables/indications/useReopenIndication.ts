import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../../i18n'
import { indicationQueryKeys } from '../../services/api/indications/query-keys'
import type { ReopenIndicationOriginApi } from '../../services/api/indications/types'
import { useToast } from '../useToast'
import { toastKeyForIndicationWriteError } from './indication-write-error'

export function useReopenIndication(api: ReopenIndicationOriginApi) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (id: string) => api.reopen({ id }),
    retry: 0,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: indicationQueryKeys.all })
      toast.push('success', t('Indications.toast.reopened'))
    },
    onError: (error) => {
      const key = toastKeyForIndicationWriteError(error)
      if (key) toast.push('error', t(key))
    },
  })

  const reopen = (id: string) => {
    if (!id || mutation.isPending.value) return
    mutation.mutate(id)
  }

  return {
    reopen,
    isReopening: mutation.isPending,
  }
}
