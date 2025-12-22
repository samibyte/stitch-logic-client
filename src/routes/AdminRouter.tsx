import type { PropsWithChildren } from "react";
import useAuth from "../hooks/useAuth";
import useGetRole from "../hooks/useGetRole";
import { Loader } from "@/components/ui/Loader";

const AdminRouter = ({ children }: PropsWithChildren) => {
  const { loading } = useAuth();
  const { role, roleLoading } = useGetRole();

  if (loading || !role || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (role !== "admin") {
    return <div>Forbidden</div>;
  }

  return children;
};

export default AdminRouter;
