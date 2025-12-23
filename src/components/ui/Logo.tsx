import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import logoLight from "/stitch-logo-light.png";
import logoDark from "/stitch-logo-dark.png";

const Logo = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-40" />;
  }

  const currentLogo = resolvedTheme === "dark" ? logoDark : logoLight;

  return (
    <div className="group relative flex h-12 w-auto cursor-pointer items-center">
      <img
        className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
        src={currentLogo}
        alt="Stitch Logic Logo"
      />

      <p className="text-foreground ml-2 text-4xl font-black tracking-tighter">
        Logic
      </p>

      {/* Modern Accent Dot */}
      <span className="bg-chart-1 mb-2 ml-1 h-2 w-2 animate-pulse self-end rounded-full" />
    </div>
  );
};

export default Logo;
