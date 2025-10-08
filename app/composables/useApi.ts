// composables/useApi.ts
export const useApiBase = () => {
  // ganti jika perlu, misal production backend URL
  const BASE = process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8080/api";
  return { BASE };
};
