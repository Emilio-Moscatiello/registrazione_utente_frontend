import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { LoginResponse } from "@/lib/api";

interface AuthUser {
  email: string;
  ruolo: "USER" | "ADMIN";
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage(): { token: string | null; user: AuthUser | null } {
  try {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token: storedToken, user: storedUser } = loadFromStorage();
  const [token, setToken] = useState<string | null>(storedToken);
  const [user, setUser] = useState<AuthUser | null>(storedUser);

  const login = useCallback((response: LoginResponse) => {
    localStorage.setItem("token", response.token);
    localStorage.setItem(
      "user",
      JSON.stringify({ email: response.email, ruolo: response.ruolo })
    );
    setToken(response.token);
    setUser({ email: response.email, ruolo: response.ruolo });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
