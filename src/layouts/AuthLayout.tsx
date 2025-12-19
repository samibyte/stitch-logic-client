import { Home } from "lucide-react";
import { Link, Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-9/12 flex-col py-8 md:pt-16">
      <Link to="/">
        <div className="flex items-center gap-2 font-medium">
          <Home />
          <p>Home</p>
        </div>
      </Link>
      <div className="flex flex-1 flex-col-reverse items-center justify-between md:flex-row md:px-20">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
