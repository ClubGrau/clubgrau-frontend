import { useRoute } from 'vue-router';

export const useRouterOptions = () => {
  const router = useRoute();

  function matchedRouter(route: string): boolean {
    return router.matched.some((record) => record.path === route);
  };

  return {
    matchedRouter,
  }
}