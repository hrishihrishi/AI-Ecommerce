"use client";
// Authentication context: provides login, register, logout and current user state.
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/nextjs";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  setUserState: (nextUser: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
// ||  'https://web-constructor-50.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

/**
 * React provider that manages authentication state and exposes auth helpers.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { signOut: clerkSignOut } = useClerk();

  // Load token from localStorage only on client
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(stored);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data as User);
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });
      const { access_token, user } = response.data as {
        access_token: string;
        user: User;
      };
      setToken(access_token);
      setUser(user);
      localStorage.setItem("token", access_token);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      return {
        success: false,
        error: err.response?.data?.detail || "Login failed",
      };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await axios.post(`${API}/auth/register`, {
        name,
        email,
        password,
        phone,
      });
      const { access_token, user } = response.data as {
        access_token: string;
        user: User;
      };
      setToken(access_token);
      setUser(user);
      localStorage.setItem("token", access_token);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      return {
        success: false,
        error: err.response?.data?.detail || "Registration failed",
      };
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem("token");
    await clerkSignOut({ redirectUrl: "/login" });
  };

  const setUserState = (nextUser: User | null) => {
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, setUserState, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useClerkSyncToBackend() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useClerkAuth();
  const { login, register, setUserState } = useAuth();
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (!isLoaded || !isSignedIn || !clerkUser) {
        syncedUserRef.current = null;
        return;
      }

      const email =
        clerkUser.primaryEmailAddress?.emailAddress ??
        clerkUser.emailAddresses?.[0]?.emailAddress ??
        "";
      const name =
        clerkUser.fullName ||
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        email.split("@")[0] ||
        "Clerk User";

      if (!email) return;

      const syncKey = `${clerkUser.id}:${email}`;
      if (syncedUserRef.current === syncKey) return;
      syncedUserRef.current = syncKey;

      setUserState({
        id: clerkUser.id,
        name,
        email,
        phone: "",
      });

      let token = "";
      try {
        token = (await getToken()) ?? "";
      } catch (error) {
        console.error("Failed to get Clerk token:", error);
        return;
      }

      if (!token) return;

      try {
        const backendResult = await register(name, email, email, "");
        if (!backendResult.success) {
          await login(email, email);
        }
      } catch (error) {
        // Ignore backend sync failures here; Clerk auth is still valid and the
        // local app user state should remain synced to the signed-in user.
      }
    };

    syncUserWithBackend();
  }, [
    isLoaded,
    isSignedIn,
    clerkUser,
    getToken,
    login,
    register,
    setUserState,
  ]);
}

export function AuthSyncHandler() {
  useClerkSyncToBackend();
  return null;
}
