import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser, LoginInput } from "@nutrivae/shared";
import { api, tokenStore } from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.access));
  useEffect(() => {
    if (!tokenStore.access) return;
    api
      .get<AuthUser>("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (input: LoginInput) => {
        const { data } = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
          "/auth/login",
          input
        );
        tokenStore.set(data.accessToken, data.refreshToken);
        setUser(data.user);
      },
      logout: async () => {
        try {
          await api.post("/auth/logout", { refreshToken: tokenStore.refresh });
        } finally {
          tokenStore.clear();
          setUser(null);
        }
      },
      switchCompany: async (companyId: string) => {
        const { data } = await api.post<{ user: AuthUser; accessToken: string }>("/auth/switch-company", {
          companyId
        });
        tokenStore.set(data.accessToken);
        setUser(data.user);
        window.location.href = "/";
      }
    }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
