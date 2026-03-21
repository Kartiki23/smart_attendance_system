import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import authService from "@/services/authService";

type UserRole = "admin" | "faculty" | "student" | "parent";

interface User {
  rollNumber: string;
  _id: string;
  rollNo: string;
  employeeId: string;
  department: string;
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await authService.getMe();
          const userData: User = {
            id: response.user.id,
            fullName: response.user.fullName,
            email: response.user.email,
            role: response.user.role as UserRole,
            avatar_url: response.user.avatar_url,
            employeeId: "",
            department: "",
            rollNumber: "",
            _id: "",
            rollNo: ""
          };
          setUser(userData);
          setRole(response.user.role as UserRole);
          setProfile({
            id: response.user.id,
            full_name: response.user.fullName,
            email: response.user.email,
            avatar_url: response.user.avatar_url
          });
        } catch (error) {
          // Token invalid, clear auth
          authService.logout();
          setUser(null);
          setRole(null);
          setProfile(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        return { error: new Error('Please enter a valid email address') };
      }

      if (!password) {
        return { error: new Error('Please enter your password') };
      }

      const response = await authService.login({ email, password });

      const userData: User = {
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        role: response.user.role as UserRole,
        avatar_url: response.user.avatar_url,
        employeeId: "",
        department: "",
        rollNumber: "",
        _id: "",
        rollNo: ""
      };
      setUser(userData);
      setRole(response.user.role as UserRole);
      setProfile({
        id: response.user.id,
        full_name: response.user.fullName,
        email: response.user.email,
        avatar_url: response.user.avatar_url
      });

      return { error: null };
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { error: new Error(errorMessage) };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        return { error: new Error('Please enter a valid email address') };
      }

      // Validate password length
      if (!password || password.length < 6) {
        return { error: new Error('Password must be at least 6 characters') };
      }

      if (!fullName || fullName.trim().length === 0) {
        return { error: new Error('Please enter your full name') };
      }

      const response = await authService.register({
        fullName,
        email,
        password,
        role: 'student' // Default role
      });

      const userData: User = {
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        role: response.user.role as UserRole,
        avatar_url: response.user.avatar_url,
        employeeId: "",
        department: "",
        rollNumber: "",
        _id: "",
        rollNo: ""
      };
      setUser(userData);
      setRole(response.user.role as UserRole);
      setProfile({
        id: response.user.id,
        full_name: response.user.fullName,
        email: response.user.email,
        avatar_url: response.user.avatar_url
      });

      return { error: null };
    } catch (error: any) {
      let errorMessage = 'Failed to create account';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    authService.logout();
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
