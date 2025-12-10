import { createBrowserRouter } from "react-router";
import RootLayout from "@/layouts/RootLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Home from "@/pages/Home/Home/Home";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import DashboardLayout from "@/layouts/DashboardLayout";
import UsersManagement from "@/pages/Dashboard/Admin/UsersManagement";
import AllProductsManagement from "@/pages/Dashboard/Admin/AllProductsManagement";
import AllOrdersManagement from "@/pages/Dashboard/Admin/AllOrdersManagement";
import AdminRouter from "./AdminRouter";
import PrivateRouter from "./PrivateRouter";
import ManagerRouter from "./ManagerRouter";
import AddProduct from "@/pages/Dashboard/Manager/AddProduct";

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
  {
    path: "/dashboard",
    element: (
      <PrivateRouter>
        <DashboardLayout />
      </PrivateRouter>
    ),
    children: [
      {
        path: "users-management",
        element: (
          <AdminRouter>
            <UsersManagement />
          </AdminRouter>
        ),
      },
      {
        path: "all-products-management",
        element: (
          <AdminRouter>
            <AllProductsManagement />
          </AdminRouter>
        ),
      },
      {
        path: "all-orders-management",
        element: (
          <AdminRouter>
            <AllOrdersManagement />
          </AdminRouter>
        ),
      },
      {
        path: "add-product",
        element: (
          <ManagerRouter>
            <AddProduct />
          </ManagerRouter>
        ),
      },
    ],
  },
]);
