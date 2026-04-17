import { useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthContextValue } from "./context";
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  persistSession,
  type AuthUser,
} from "./storage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const value = useMemo<AuthContextValue>(() => {
    function signIn(nextToken: string, nextUser: AuthUser) {
      persistSession(nextToken, nextUser);
      setToken(nextToken);
      setUser(nextUser);
    }

    function signOut() {
      clearStoredSession();
      setToken(null);
      setUser(null);
    }

    return {
      token,
      user,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
