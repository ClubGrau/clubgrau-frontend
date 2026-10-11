import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { t } from '../../i18n'
import { normalizeIndicationOriginName } from '../../domain/indication-origin-name'
import { indicationQueryKeys } from '../../services/api/indications/query-keys'
import type { CorrectIndicationOriginNameApi } from '../../services/api/indications/types'
import type { Indication } from '../../types/indication'
import { useToast } from '../useToast'
import { toastKeyForIndicationWriteError } from './indication-write-error'

interface CorrectIndicationOriginNameOptions {
  onCorrected: () => void
}

export function useCorrectIndicationOriginName(
  api: CorrectIndicationOriginNameApi,
  options: CorrectIndicationOriginNameOptions,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (payload: Indication.CorrectOriginNameCommand) =>
      api.correctName({
        id: payload.id,
        name: normalizeIndicationOriginName(payload.name),
      }),
    retry: 0,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: indicationQueryKeys.all })
      toast.push('success', t('Indications.toast.corrected'))
      options.onCorrected()
    },
    onError: (error) => {
      const key = toastKeyForIndicationWriteError(error, 'Indications.toast.nameTaken')
      if (key) toast.push('error', t(key))
    },
  })

  const correctName = (payload: Indication.CorrectOriginNameCommand) => {
    if (mutation.isPending.value) return
    mutation.mutate(payload)
  }

  return {
    correctName,
    isCorrectingName: mutation.isPending,
  }
}
