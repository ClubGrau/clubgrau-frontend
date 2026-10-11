import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../../i18n'
import { normalizeIndicationOriginName } from '../../domain/indication-origin-name'
import { indicationQueryKeys } from '../../services/api/indications/query-keys'
import type { CreateIndicationOriginApi } from '../../services/api/indications/types'
import type { Indication } from '../../types/indication'
import { useToast } from '../useToast'
import { toastKeyForIndicationWriteError } from './indication-write-error'

interface CreateIndicationOriginOptions {
  onCreated: () => void
}

export function useCreateIndicationOrigin(
  api: CreateIndicationOriginApi,
  options: CreateIndicationOriginOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (payload: Indication.CreateOriginCommand) =>
      api.create({
        categoryId: payload.categoryId,
        name: normalizeIndicationOriginName(payload.name),
      }),
    retry: 0,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: indicationQueryKeys.all })
      toast.push('success', t('Indications.toast.created'))
      options.onCreated()
    },
    onError: (error) => {
      const key = toastKeyForIndicationWriteError(error, 'Indications.toast.nameTaken')
      if (key) toast.push('error', t(key))
    },
  })

  const createOrigin = (payload: Indication.CreateOriginCommand) => {
    if (mutation.isPending.value) return
    mutation.mutate(payload)
  }

  return {
    createOrigin,
    isCreatingOrigin: mutation.isPending,
  }
}
