import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="max-w-9/12 py-8 md:pt-16 mx-auto flex flex-col min-h-screen">
      <div className="flex md:flex-row flex-col-reverse md:px-20 items-center justify-between flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
