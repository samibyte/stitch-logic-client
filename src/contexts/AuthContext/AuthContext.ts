import { createContext, type Dispatch, type SetStateAction } from "react";
import type { User, UserProfile, UserCredential } from "firebase/auth";

export interface AuthInfo {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  signInUser: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  updateUserProfile: (info: UserProfile) => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthInfo | null>(null);
