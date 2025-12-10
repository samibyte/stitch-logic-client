"use client";

import { Flag } from "lucide-react";
import * as React from "react";

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
import {
  IconBrandAmongUs,
  IconCarambola,
  IconMailbox,
} from "@tabler/icons-react";
import { NavUser } from "@/components/sidebar-04/nav-user";
import { NavLink } from "react-router";
import { Button } from "../ui/button";

// This is sample data
const data = {
  user: {
    name: "admin",
    email: "admin@stitch.com",
    avatar: "/avatar-01.png",
  },
  navMain: [
    {
      title: "All Products",
      url: "/dashboard/all-products-management",
      icon: IconCarambola,
    },
    {
      title: "All Orders",
      url: "/dashboard/all-orders-management",
      icon: Flag,
    },
    {
      title: "Manage Users",
      url: "/dashboard/users-management",
      icon: IconMailbox,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <div className="flex">
      {/* This is the first sidebar */}
      <Sidebar
        style={{ "--sidebar-width": "12rem" } as React.CSSProperties}
        collapsible="none"
        className="border-r p-2 px-1"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <IconBrandAmongUs className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Button variant="ghost">
                      <NavLink to={item.url}>
                        {" "}
                        <span className="flex items-center gap-2">
                          <item.icon />
                          {item.title}
                        </span>
                      </NavLink>
                    </Button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
