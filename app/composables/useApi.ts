// composables/useApi.ts
export const useApiBase = () => {
  // ganti jika perlu, misal production backend URL
  const BASE = process.env.NUXT_PUBLIC_API_BASE;
  return { BASE };
};
