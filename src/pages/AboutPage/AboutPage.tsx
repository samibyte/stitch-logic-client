import { motion } from "framer-motion";
import {
  Factory,
  ShieldCheck,
  Globe,
  Users,
  Target,
  Rocket,
} from "lucide-react";

const stats = [
  {
    label: "Partner Factories",
    value: "48+",
    icon: <Factory className="text-chart-1 h-5 w-5" />,
  },
  {
    label: "Global Buyers",
    value: "1.2k",
    icon: <Globe className="text-chart-2 h-5 w-5" />,
  },
  {
    label: "Orders Tracked",
    value: "240k",
    icon: <ShieldCheck className="text-chart-3 h-5 w-5" />,
  },
  {
    label: "Active Managers",
    value: "150+",
    icon: <Users className="text-chart-4 h-5 w-5" />,
  },
];

const values = [
  {
    title: "Real-time Visibility",
    desc: "We believe transparency is the foundation of trust in the garment supply chain.",
    icon: <Target className="h-8 w-8" />,
    color: "var(--chart-1)",
  },
  {
    title: "Production Excellence",
    desc: "Our system is built to minimize bottlenecks and maximize factory floor efficiency.",
    icon: <Rocket className="h-8 w-8" />,
    color: "var(--chart-2)",
  },
];

const AboutPage = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* 1. Hero Section */}
      <section className="border-border/50 relative overflow-hidden border-b py-24">
        <div className="bg-primary/[0.02] absolute inset-0 -z-10" />
        <div className="container mx-auto px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-chart-1 mb-4 block text-xs font-black tracking-[0.3em] uppercase"
          >
            Our Mission
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-5xl font-black tracking-tighter md:text-7xl"
          >
            Revolutionizing the <br />
            <span className="text-muted-foreground font-light italic">
              Garment Ecosystem.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed"
          >
            We bridge the gap between small-to-medium factories and global
            buyers through precision tracking and data-driven production
            management.
          </motion.p>
        </div>
      </section>

      {/* 2. Brand Story / Image Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="border-border overflow-hidden rounded-3xl border shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1000"
                  alt="Our Team"
                  className="h-[500px] w-full object-cover grayscale-[0.3] transition-all duration-700 hover:grayscale-0"
                />
              </div>
              {/* Decorative Badge */}
              <div className="bg-primary absolute -right-6 -bottom-6 hidden rounded-2xl p-8 shadow-xl md:block">
                <p className="text-primary-foreground text-4xl font-black">
                  10+
                </p>
                <p className="text-primary-foreground/70 text-xs font-bold tracking-widest uppercase">
                  Years of Industry <br /> Expertise
                </p>
              </div>
            </motion.div>

            <div className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tight">
                The Story Behind the{" "}
                <span className="text-chart-2">Tracker.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded in 2024, our platform was born on the factory floor. We
                saw the chaos of manual ledgers and the frustration of delayed
                shipments.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our team of engineers and garment experts built a system that
                speaks the language of production—cutting, sewing, finishing—and
                translates it into a real-time dashboard for the world to see.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-6">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="border-border bg-card/50 rounded-xl border p-4"
                  >
                    <div className="mb-2">{stat.icon}</div>
                    <div className="text-2xl font-black">{stat.value}</div>
                    <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Values */}
      <section className="bg-accent/30 border-border/50 border-y py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Built on Core Values</h2>
            <div className="bg-primary mx-auto h-1 w-20 rounded-full" />
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {values.map((val, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-card border-border rounded-3xl border p-10 text-center shadow-sm"
              >
                <div
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: val.color + "15",
                    color: val.color,
                  }}
                >
                  {val.icon}
                </div>
                <h4 className="mb-4 text-xl font-bold">{val.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {val.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Contact CTA */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="mb-8 text-4xl font-black">
            Ready to Optimize Your Floor?
          </h2>
          <button className="bg-primary text-primary-foreground shadow-primary/20 h-14 rounded-full px-10 font-bold shadow-lg transition-all hover:opacity-90">
            Get in Touch with Us
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
