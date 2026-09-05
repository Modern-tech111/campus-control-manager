/**
 * Auth hook backed by the MySQL `users` table and the local API
 * (server/index.ts). Keeps the same interface as the original static
 * hook so pages, sidebar and topbar work unchanged.
 */
import { useAuthContext, type AuthUser } from "@/context/auth";

export type { AuthUser };

export function useAuth() {
  const { isLoading, isAuthenticated, user, signIn, signUp, signOut } =
    useAuthContext();

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signUp,
    signOut,
  };
}