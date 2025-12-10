import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { BellIcon, HelpCircleIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link, NavLink } from "react-router";
import useAuth from "@/hooks/useAuth";

// Hamburger icon component
const HamburgerIcon = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={cn("pointer-events-none", className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

// Info Menu Component
const InfoMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <HelpCircleIcon className="h-4 w-4" />
        <span className="sr-only">Help and Information</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Help Center</DropdownMenuItem>
      <DropdownMenuItem>Documentation</DropdownMenuItem>
      <DropdownMenuItem>Contact Support</DropdownMenuItem>
      <DropdownMenuItem>Send Feedback</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Notification Menu Component
const NotificationMenu = ({
  notificationCount = 3,
}: {
  notificationCount?: number;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="relative h-9 w-9">
        <BellIcon className="h-4 w-4" />
        {notificationCount > 0 && (
          <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs">
            {notificationCount > 9 ? "9+" : notificationCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">New message received</p>
          <p className="text-muted-foreground text-xs">2 minutes ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">System update available</p>
          <p className="text-muted-foreground text-xs">1 hour ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Weekly report ready</p>
          <p className="text-muted-foreground text-xs">3 hours ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>View all notifications</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// User Menu Component
const UserMenu = ({
  userName = "John Doe",
  userEmail = "john@example.com",
  userAvatar,
}: {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}) => {
  const { signOutUser } = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-accent hover:text-accent-foreground h-9 px-2 py-0"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="text-xs">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <ChevronDownIcon className="ml-1 h-3 w-3" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{userName}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOutUser()}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Navbar05 = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkWidth();

    // Add event listener for window resize
    window.addEventListener("resize", checkWidth);

    return () => {
      window.removeEventListener("resize", checkWidth);
    };
  }, []);

  // Combine refs
  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      containerRef.current = node;

      if (ref) {
        if (typeof ref === "function") {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    },
    [ref],
  );

  const { user } = useAuth();
  const userName = user?.displayName || "username";
  const userEmail = user?.email || "useremail";
  const userAvatar = user?.photoURL || "photoUrl";
  const notificationCount = 3;

  const navigationLinks = user
    ? [
        { href: "/", label: "Home" },
        { href: "/all-products", label: "All Products" },
        { href: "/dashboard", label: "Dashboard" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/all-products", label: "All Products" },
        { href: "/contact", label: "Contact" },
        { href: "/about-us", label: "About Us" },
      ];
  return (
    <header
      ref={setRefs}
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b px-4 backdrop-blur md:px-6",
        className,
      )}
      {...props}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          {isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group hover:bg-accent hover:text-accent-foreground h-9 w-9"
                  variant="ghost"
                  size="icon"
                >
                  <HamburgerIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-1">
                <NavigationMenu className="max-w-none">
                  <NavigationMenuList className="flex flex-col items-start gap-0">
                    {navigationLinks.map((link) => (
                      <NavigationMenuItem key={link.href} className="w-full">
                        <NavLink
                          to={link.href}
                          className={({ isActive }) =>
                            cn(
                              "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors",
                              isActive
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent hover:text-accent-foreground",
                            )
                          }
                        >
                          {link.label}
                        </NavLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          )}
          <NavLink
            to="/"
            className="text-primary hover:text-primary/90 flex cursor-pointer items-center space-x-2 transition-colors"
          >
            <span className="hidden text-xl font-bold sm:inline-block">
              shadcn.io
            </span>
          </NavLink>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Desktop navigation menu */}
          {!isMobile && (
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {navigationLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <NavLink
                        to={link.href}
                        className={({ isActive }) =>
                          cn(
                            "bg-background hover:text-primary focus:bg-accent focus:text-accent-foreground inline-flex h-10 w-max cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )
                        }
                      >
                        {link.label}
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <InfoMenu />
                <NotificationMenu notificationCount={notificationCount} />
              </div>
              <UserMenu
                userName={userName}
                userEmail={userEmail}
                userAvatar={userAvatar}
              />
            </>
          ) : (
            <>
              <>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="cursor-pointer text-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="default"
                    size="lg"
                    className="cursor-pointer text-sm"
                  >
                    Register
                  </Button>
                </Link>
              </>
            </>
          )}
        </div>
      </div>
    </header>
  );
});

Navbar05.displayName = "Navbar05";

export { HamburgerIcon, InfoMenu, NotificationMenu, UserMenu };
