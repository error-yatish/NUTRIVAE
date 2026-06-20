import type { ApiResponse, AuthUser } from "@nutrivae/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export const tokenStore = {
  get access() {
    return localStorage.getItem("nv_access");
  },
  get refresh() {
    return localStorage.getItem("nv_refresh");
  },
  set(access: string, refresh?: string) {
    localStorage.setItem("nv_access", access);
    if (refresh) localStorage.setItem("nv_refresh", refresh);
  },
  clear() {
    localStorage.removeItem("nv_access");
    localStorage.removeItem("nv_refresh");
  }
};

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(tokenStore.access ? { Authorization: `Bearer ${tokenStore.access}` } : {}),
      ...init.headers
    }
  });
  if (response.status === 401 && retry && tokenStore.refresh && path !== "/auth/refresh") {
    const refreshed = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokenStore.refresh })
    });
    if (refreshed.ok) {
      const payload = (await refreshed.json()) as ApiResponse<{ accessToken: string; user: AuthUser }>;
      tokenStore.set(payload.data.accessToken);
      return request<T>(path, init, false);
    }
    tokenStore.clear();
    window.location.href = "/login";
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error?.message ?? "Request failed");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  get: <T>(path: string) => request<ApiResponse<T>>(path),
  post: <T>(path: string, body: unknown) =>
    request<ApiResponse<T>>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<ApiResponse<T>>(path, { method: "PATCH", body: JSON.stringify(body) })
};
