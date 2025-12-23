import { motion } from "framer-motion";
import {
  AlertTriangle,
  Home,
  ArrowLeft,
  Search,
  Map,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const suggestedPages = [
  {
    title: "Dashboard Overview",
    description: "Track your production lines",
    path: "/dashboard",
    color: "var(--chart-1)",
  },
  {
    title: "My Profile",
    description: "Go to you profile",
    path: "/dashboard/profile",
    color: "var(--chart-2)",
  },
];

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      {/* 1. Hero Section */}
      <section className="border-border/50 relative overflow-hidden border-b py-24">
        <div className="bg-primary/[0.02] absolute inset-0 -z-10" />
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 inline-flex items-center justify-center gap-3"
          >
            <div className="relative">
              <AlertTriangle className="text-chart-1 h-16 w-16" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="text-chart-1/20 absolute inset-0 blur-xl"
              >
                <AlertTriangle className="h-16 w-16" />
              </motion.div>
            </div>
            <span className="text-foreground text-7xl font-black">404</span>
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-chart-2 mb-4 block text-xs font-black tracking-[0.3em] uppercase"
          >
            Lost in Production
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-5xl font-black tracking-tighter md:text-7xl"
          >
            Page Not <span className="text-chart-1">Found.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed"
          >
            The production line you're looking for seems to have shifted. Don't
            worry—our floor managers are on it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate("/")}
              className="group h-12 gap-2 px-8"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="group h-12 gap-2 px-8"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Previous Page
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 2. Suggested Routes */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Explore These <span className="text-chart-2">Active</span> Lines
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              While we locate that missing page, here are some production-ready
              routes:
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            {suggestedPages.map((page, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 300 },
                }}
                onClick={() => navigate(page.path)}
                className="group cursor-pointer"
              >
                <div className="bg-card border-border hover:border-primary/30 rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl">
                  <div
                    className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: page.color + "15",
                    }}
                  >
                    <Compass
                      className="h-6 w-6 transition-transform group-hover:rotate-12"
                      style={{ color: page.color }}
                    />
                  </div>
                  <h4 className="mb-2 text-lg font-bold">{page.title}</h4>
                  <p className="text-muted-foreground text-sm">
                    {page.description}
                  </p>
                  <div className="text-primary mt-6 flex items-center gap-2 text-xs font-bold tracking-widest uppercase opacity-0 transition-opacity group-hover:opacity-100">
                    <span>Navigate</span>
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Search Section */}
      <section className="bg-accent/30 border-border/50 border-y py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <Search className="text-chart-3 mx-auto mb-6 h-12 w-12" />
              <h3 className="mb-4 text-2xl font-bold">
                Can't Find What You're Looking For?
              </h3>
              <p className="text-muted-foreground mb-8">
                Our floor managers are trained to locate any missing component.
                Try searching:
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search production lines, orders, or documentation..."
                className="bg-background border-border focus:border-primary focus:shadow-primary/20 h-16 w-full rounded-full border pr-24 pl-6 shadow-lg transition-all outline-none"
              />
              <Button className="absolute top-2 right-2 h-12 gap-2 rounded-full px-6">
                <Search className="h-4 w-4" />
                Search Floor
              </Button>
            </motion.div>

            <p className="text-muted-foreground mt-6 text-sm">
              Or contact our support team at{" "}
              <a
                href="mailto:support@garmenttrack.com"
                className="text-chart-2 font-bold hover:underline"
              >
                support@garmenttrack.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Map Visual */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <div className="bg-card border-border relative overflow-hidden rounded-3xl border p-8 md:p-12">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-10" />

              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-center gap-4">
                  <Map className="text-chart-4 h-8 w-8" />
                  <h3 className="text-2xl font-bold">
                    Global Production Network
                  </h3>
                </div>

                <div className="bg-muted relative h-64 w-full rounded-xl">
                  {/* Simplified world map dots */}
                  <div className="bg-chart-1 absolute top-1/4 left-1/4 h-4 w-4 animate-pulse rounded-full"></div>
                  <div className="bg-chart-2 absolute top-1/3 left-1/2 h-4 w-4 animate-pulse rounded-full"></div>
                  <div className="bg-chart-3 absolute top-1/2 right-1/4 h-4 w-4 animate-pulse rounded-full"></div>
                  <div className="bg-chart-4 absolute top-3/4 left-1/3 h-4 w-4 animate-pulse rounded-full"></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xl font-bold italic">
                        Every route leads to production
                      </p>
                      <p className="text-muted-foreground/60 mt-2">
                        48+ factories connected worldwide
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;
