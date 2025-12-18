import * as React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavUser } from "@/components/sidebar-04/nav-user";
import { Button } from "../ui/button";
import useAuth from "@/hooks/useAuth";

import {
  Package,
  ShoppingCart,
  Users,
  Check,
  PhoneIncoming,
  User,
  FactoryIcon,
} from "lucide-react";
import useGetRole from "@/hooks/useGetRole";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type Role = "admin" | "manager" | "buyer" | undefined;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { role } = useGetRole() as { role: Role };

  const userData = {
    name: user?.displayName ?? "buyer",
    email: user?.email ?? "",
    avatar: user?.photoURL ?? "/avatar-01.png",
  };

  const navItems: Record<Exclude<Role, undefined>, NavItem[]> = {
    admin: [
      {
        title: "Manage Users",
        url: "/dashboard/users-management",
        icon: Users,
      },
      {
        title: "All Products",
        url: "/dashboard/all-products-management",
        icon: Package,
      },
      {
        title: "All Orders",
        url: "/dashboard/all-orders-management",
        icon: ShoppingCart,
      },
    ],

    manager: [
      {
        title: "Manage Products",
        url: "/dashboard/manage-products",
        icon: ShoppingCart,
      },
      {
        title: "Add Product",
        url: "/dashboard/add-product",
        icon: Package,
      },

      {
        title: "Pending Orders",
        url: "/dashboard/pending-orders",
        icon: PhoneIncoming,
      },
      {
        title: "Approved Orders",
        url: "/dashboard/approved-orders",
        icon: Check,
      },
      {
        title: "My Profile",
        url: "/dashboard/profile",
        icon: User,
      },
    ],

    buyer: [
      {
        title: "My Orders",
        url: "/dashboard/my-orders",
        icon: ShoppingCart,
      },
      {
        title: "Track Order",
        url: "/dashboard/track-orders",
        icon: ShoppingCart,
      },
      {
        title: "My Profile",
        url: "/dashboard/profile",
        icon: ShoppingCart,
      },
    ],
  };

  const roleData = {
    user: userData,
    navMain: role ? (navItems[role] ?? []) : [],
  };

  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!role || roleData.navMain.length === 0) return;

    const currentPath = location.pathname;

    if (currentPath === "/dashboard") {
      navigate(roleData.navMain[0].url, { replace: true });
    }
  }, [role, roleData.navMain, location.pathname, navigate]);

  return (
    <div className="flex">
      <Sidebar
        style={{ "--sidebar-width": "12rem" } as React.CSSProperties}
        collapsible="none"
        className="border-r p-2 px-1"
        {...props}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link to="/" className="flex items-center gap-2">
                  <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square h-8 w-8 items-center justify-center rounded-lg">
                    <FactoryIcon />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Stitch Logic</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {roleData.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Button variant="ghost" className="w-full justify-start">
                      <NavLink
                        to={item.url}
                        className="flex w-full items-center gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </Button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <NavUser user={roleData.user} />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
