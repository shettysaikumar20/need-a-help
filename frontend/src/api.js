export async function apiFetch(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options });
  return response;
}
