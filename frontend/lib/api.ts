export function getApiBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function serverApi(
  request: Request,
  path: string,
  options?: RequestInit
): Promise<Response> {
  const apiBaseUrl = getApiBaseUrl(request);
  return fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": request.headers.get("Authorization") || "",
      "Cookie": request.headers.get("Cookie") || "",
      ...options?.headers,
    },
  });
}

export async function clientApi(
  path: string,
  options?: RequestInit
): Promise<Response> {
  return fetch(path, {
    ...options,
    credentials: "include", // Cookieを自動的に送信
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}
