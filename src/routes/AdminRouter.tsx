import type { PropsWithChildren } from "react";
import useAuth from "../hooks/useAuth";
import useGetRole from "../hooks/useGetRole";

const AdminRouter = ({ children }: PropsWithChildren) => {
  const { loading } = useAuth();
  const { role, roleLoading } = useGetRole();

  if (loading || !role || roleLoading) {
    return <div>loading...</div>;
  }

  if (role !== "admin") {
    return <div>Forbidden</div>;
  }

  return children;
};

export default AdminRouter;
