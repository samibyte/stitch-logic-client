import { Link } from "react-router";
import logoLight from "/stitch-logo-light.png";
import logoDark from "/stitch-logo-dark.png";

const NavbarLogo = () => {
  return (
    <Link to="/" className="group flex items-center gap-0">
      <div className="flex items-center">
        {/* Light Theme Logo: Visible by default, hidden when .dark class is present */}
        <img
          className="w-26 object-contain transition-transform duration-300 group-hover:scale-105 dark:hidden"
          src={logoLight}
          alt="Stitch Logic"
        />

        {/* Dark Theme Logo: Hidden by default, visible only when .dark class is present */}
        <img
          className="hidden w-26 object-contain transition-transform duration-300 group-hover:scale-105 dark:block"
          src={logoDark}
          alt="Stitch Logic"
        />

        {/* Text color updated to 'text-foreground' to match your index.css theme */}
        <p className="text-foreground text-3xl font-black tracking-tighter">
          Logic
        </p>
      </div>

      {/* Modern Status Indicator (Optional - shows the system is 'live') */}
      <span className="bg-chart-2 mb-4 ml-1 h-1.5 w-1.5 animate-pulse rounded-full" />
    </Link>
  );
};

export default NavbarLogo;
