import { AppSidebar } from "@/components/sidebar-04/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header: Visible only on small screens */}
          <header className="flex h-12 items-center border-b px-4 md:hidden">
            <SidebarTrigger />
            <span className="ml-4 font-semibold">Stitch Logic</span>
          </header>

          <div className="m-2 h-full overflow-y-auto rounded-xl border p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
