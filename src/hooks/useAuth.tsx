import { use } from "react";
import { AuthContext } from "@/contexts/AuthContext/AuthContext";

const useAuth = () => {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth Must be used within AuthProvider");
  }
  return context;
};

export default useAuth;
