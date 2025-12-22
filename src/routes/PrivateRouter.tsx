import type { PropsWithChildren } from "react";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router";
import { Loader } from "@/components/ui/Loader";

const PrivateRouter = ({ children }: PropsWithChildren) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate state={location.pathname} to="/login"></Navigate>;
  }

  return children;
};

export default PrivateRouter;
