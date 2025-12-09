import { createBrowserRouter } from "react-router";
import RootLayout from "@/layouts/RootLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Home from "@/pages/Home/Home/Home";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        Component: Home,
      },
    ],
  },
  {
    path: "/",
    Component: AuthLayout,
    children: [
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
    ],
  },
]);
