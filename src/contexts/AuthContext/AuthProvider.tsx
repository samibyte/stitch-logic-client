import {
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
  type UserCredential,
  type UserProfile,
} from "firebase/auth";
import auth from "@/firebase/firebase.init";

interface AuthProviderProps {
  children: ReactNode;
}

const googleProvider = new GoogleAuthProvider();

type AuthInfo = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  signInUser: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  updateUserProfile: (info: UserProfile) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setloading] = useState(true);

  const createUser = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInUser = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const updateUserProfile = (updateInfo: UserProfile) => {
    if (!auth.currentUser) {
      return Promise.reject("No user is logged in");
    }

    return updateProfile(auth.currentUser, updateInfo);
  };

  const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const signOutUser = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setloading(false);
    });

    return () => unsubscribe();
  }, []);
  const authInfo: AuthInfo = {
    user,
    setUser,
    loading,
    createUser,
    signInUser,
    updateUserProfile,
    signInWithGoogle,
    signOutUser,
  };

  return <AuthContext value={authInfo}>{children}</AuthContext>;
};

export default AuthProvider;
