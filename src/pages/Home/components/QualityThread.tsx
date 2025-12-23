import { motion } from "framer-motion";
import { Info, Layers, Wind, Droplets } from "lucide-react";

const materials = [
  {
    name: "Heavyweight Denim",
    origin: "Turkey",
    stock: "4,500m",
    property: "Durable",
    icon: <Layers className="h-5 w-5" />,
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600",
    color: "var(--chart-1)",
  },
  {
    name: "Organic Cotton",
    origin: "India",
    stock: "12,200m",
    property: "Breathable",
    icon: <Wind className="h-5 w-5" />,
    image:
      "https://images.unsplash.com/photo-1476683874822-744764a2438f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "var(--chart-2)",
  },
  {
    name: "Tech-Nylon",
    origin: "Japan",
    stock: "2,800m",
    property: "Waterproof",
    icon: <Droplets className="h-5 w-5" />,
    image:
      "https://italianartisan.com/wp-content/uploads/2025/07/divazus-fabric-store-yvHWeywIljs-unsplash-1024x683.webp",
    color: "var(--chart-3)",
  },
];

const QualityThread = () => {
  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-chart-4 mb-4 flex items-center gap-2 text-xs font-black tracking-[0.2em] uppercase"
          >
            <Info className="h-4 w-4" />
            <span>Material Intelligence</span>
          </motion.div>
          <h2 className="mb-6 text-4xl font-black tracking-tight md:text-5xl">
            Sourced for <br />{" "}
            <span className="text-muted-foreground">Performance.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Our inventory consists of premium fabrics sourced globally.
            Real-time stock monitoring ensures no production delays.
          </p>
        </div>

        {/* Interactive Material Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {materials.map((mat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-[450px] cursor-pointer overflow-hidden rounded-3xl"
            >
              {/* Background Image */}
              <img
                src={mat.image}
                alt={mat.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-80" />

              {/* Content Box */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-2"
                  style={{ color: mat.color }}
                >
                  {mat.icon}
                </div>

                <h3 className="mb-2 text-2xl font-bold text-white">
                  {mat.name}
                </h3>

                <div className="flex translate-y-4 items-center gap-4 text-sm font-medium text-white/60 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-widest text-white/40 uppercase">
                      Origin
                    </span>
                    <span>{mat.origin}</span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-widest text-white/40 uppercase">
                      In Stock
                    </span>
                    <span style={{ color: mat.color }}>{mat.stock}</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-chart-2 absolute top-6 right-6 h-2 w-2 animate-pulse rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QualityThread;
