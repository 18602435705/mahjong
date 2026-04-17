import { createContext } from "react";
import type { AuthUser } from "./storage";

export interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (token: string, user: AuthUser) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
