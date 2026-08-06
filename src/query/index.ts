import { QueryClient, VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const vueQueryOptions: VueQueryPluginOptions = {
  queryClient,
}

export { VueQueryPlugin }
