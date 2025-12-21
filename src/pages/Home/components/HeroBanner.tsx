import { motion, type Variants } from "framer-motion";
import { ArrowRight, Factory, PackageCheck } from "lucide-react";
import { Link } from "react-router";

const HeroBanner = () => {
  // Stagger effect for content
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const fadeUp: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-background relative flex min-h-[85vh] items-center overflow-hidden px-6 lg:px-12">
      {/* Dynamic Background Accents using Theme Colors */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <div className="bg-primary/10 absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full blur-[120px]" />
        <div className="bg-chart-1/10 absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <div className="z-10 container mx-auto grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          <motion.div
            variants={fadeUp}
            className="bg-accent text-accent-foreground border-border mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
          >
            <Factory className="text-chart-2 h-4 w-4" />
            <span>Next-Gen Garment Tracking</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-foreground mb-6 text-5xl leading-[1.05] font-bold tracking-tight md:text-7xl"
          >
            Efficiency <span className="text-chart-1">Threaded</span> Through
            Technology.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-muted-foreground mb-10 max-w-lg text-lg leading-relaxed"
          >
            Optimize your production floor. Track every garment from the first
            cut to the final stitch with precision and real-time transparency.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link to="/all-products">
              <button className="bg-primary text-primary-foreground flex h-14 items-center justify-center gap-2 rounded-lg px-10 font-bold shadow-md transition-all hover:opacity-90 active:scale-95">
                Explore Products <ArrowRight className="h-5 w-5" />
              </button>
            </Link>

            <Link to="/about-us">
              <button className="bg-secondary text-secondary-foreground border-border hover:bg-accent h-14 rounded-lg border px-10 font-bold transition-all">
                Our Workflow
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Visual Composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="relative hidden lg:block"
        >
          {/* Main Visual Frame */}
          <div className="border-border bg-card relative overflow-hidden rounded-2xl border p-4 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1000&auto=format&fit=crop"
              alt="Quality Control"
              className="h-[500px] w-full rounded-xl object-cover"
            />

            {/* Dark Mode Overlay for Image Integration */}
            <div className="bg-primary/5 absolute inset-0 dark:bg-black/20" />
          </div>

          {/* Floating Card: Production Status */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="bg-card border-border absolute -top-8 -left-8 flex items-center gap-4 rounded-xl border p-5 shadow-xl"
          >
            <div className="bg-chart-2/20 flex h-12 w-12 items-center justify-center rounded-lg">
              <PackageCheck className="text-chart-2 h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                Live Status
              </p>
              <p className="text-foreground text-base font-semibold italic">
                Sewing: Line A-04
              </p>
            </div>
          </motion.div>

          {/* Floating Card: Metrics */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="bg-primary text-primary-foreground absolute -right-6 -bottom-6 min-w-[180px] rounded-2xl p-6 shadow-2xl"
          >
            <p className="mb-1 text-3xl font-black">94%</p>
            <div className="bg-primary-foreground/20 h-1 w-full overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "94%" }}
                transition={{ duration: 1.5, delay: 1 }}
                className="bg-chart-4 h-full"
              />
            </div>
            <p className="mt-3 text-[11px] font-medium uppercase opacity-80">
              Daily Target Reached
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
