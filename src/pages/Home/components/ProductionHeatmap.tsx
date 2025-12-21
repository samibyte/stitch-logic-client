import { motion } from "framer-motion";
import { Activity, Zap, ShieldCheck } from "lucide-react";

const factoryLines = [
  { id: "A-01", status: "Cutting", efficiency: 94, color: "var(--chart-1)" },
  { id: "B-04", status: "Sewing", efficiency: 88, color: "var(--chart-2)" },
  { id: "C-02", status: "Finishing", efficiency: 98, color: "var(--chart-3)" },
  { id: "D-09", status: "QC Check", efficiency: 91, color: "var(--chart-4)" },
];

const ProductionHeatmap = () => {
  return (
    <section className="bg-card border-border border-y py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="text-chart-2 mb-4 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
              <Activity className="h-4 w-4 animate-pulse" />
              <span>Real-time Floor Metrics</span>
            </div>
            <h2 className="mb-6 text-4xl leading-tight font-black">
              Factory Floor <br />{" "}
              <span className="text-muted-foreground">Pulse Monitor</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Our proprietary tracking engine monitors every production line in
              real-time, ensuring zero-bottleneck manufacturing.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="text-chart-4 h-5 w-5" />
                <span className="text-sm font-semibold">
                  99.8% System Uptime
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-chart-1 h-5 w-5" />
                <span className="text-sm font-semibold">
                  Automated Quality Gateways
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
            {factoryLines.map((line) => (
              <motion.div
                key={line.id}
                whileHover={{ y: -5 }}
                className="bg-background border-border group rounded-2xl border p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-xs">
                    LINE_{line.id}
                  </span>
                  <span
                    className="bg-accent rounded px-2 py-1 text-[10px] font-bold uppercase"
                    style={{ color: line.color }}
                  >
                    {line.status}
                  </span>
                </div>
                <div className="mb-4 text-3xl font-black">
                  {line.efficiency}%
                </div>
                <div className="bg-accent h-1.5 w-full overflow-hidden rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${line.efficiency}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full"
                    style={{ backgroundColor: line.color }}
                  />
                </div>
                <p className="text-muted-foreground group-hover:text-foreground mt-3 text-[10px] font-medium tracking-tighter uppercase transition-colors">
                  Operational Efficiency
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductionHeatmap;
