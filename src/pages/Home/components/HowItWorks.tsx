import { motion, type Variants } from "framer-motion";
import { UserPlus, Shirt, Settings2, Truck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    title: "Onboarding",
    desc: "Register as a Buyer or Manager to access your specialized dashboard.",
    icon: <UserPlus className="h-6 w-6" />,
    color: "var(--chart-1)",
  },
  {
    title: "Order Placement",
    desc: "Buyers browse the catalog and place orders with specific quantities.",
    icon: <Shirt className="h-6 w-6" />,
    color: "var(--chart-2)",
  },
  {
    title: "Production Tracking",
    desc: "Managers update real-time progress from cutting to quality check.",
    icon: <Settings2 className="h-6 w-6" />,
    color: "var(--chart-3)",
  },
  {
    title: "Delivery & Logistics",
    desc: "Track your shipment in real-time until it reaches your warehouse.",
    icon: <Truck className="h-6 w-6" />,
    color: "var(--chart-4)",
  },
];

const HowItWorks = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const cardVariants: Variants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-accent/30 relative overflow-hidden py-24">
      {/* Background decoration */}
      <div className="via-border absolute top-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />

      <div className="container mx-auto px-6">
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <h2 className="text-chart-1 mb-4 text-sm font-black tracking-[0.3em] uppercase">
            Workflow
          </h2>
          <h3 className="text-foreground mb-6 text-4xl font-bold tracking-tight md:text-5xl">
            Our Production{" "}
            <span className="text-muted-foreground text-3xl font-light italic">
              Simplified
            </span>
          </h3>
          <p className="text-muted-foreground text-lg">
            Experience a seamless transition from order placement to doorstep
            delivery with our integrated tracking ecosystem.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Connecting Line (Desktop) */}
          <div className="bg-border absolute top-1/2 left-0 z-0 hidden h-0.5 w-full -translate-y-12 lg:block" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group relative z-10 flex flex-col items-center text-center"
            >
              {/* Icon Bubble */}
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg transition-transform duration-500 group-hover:rotate-12"
                style={{
                  backgroundColor: step.color + "20",
                  color: step.color,
                  border: `1px solid ${step.color}40`,
                }}
              >
                {step.icon}

                {/* Step Number Badge */}
                <div className="bg-background border-border text-foreground absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold shadow-sm">
                  {index + 1}
                </div>
              </div>

              <h4 className="text-foreground group-hover:text-primary mb-3 text-xl font-bold transition-colors">
                {step.title}
              </h4>
              <p className="text-muted-foreground px-4 text-sm leading-relaxed">
                {step.desc}
              </p>

              {/* Completion Icon for last step */}
              {index === steps.length - 1 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-chart-2 mt-6 flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
                >
                  <CheckCircle2 className="h-4 w-4" /> Finalized
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Visual Bottom Border */}
      <div className="via-border absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent to-transparent" />
    </section>
  );
};

export default HowItWorks;
