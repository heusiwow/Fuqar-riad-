export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)
    ?.trim()
    .replace(/\/+$/, '');
  if (envBase) {
    return `${envBase}${cleanPath}`;
  }
  return cleanPath;
}
