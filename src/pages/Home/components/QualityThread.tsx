import { motion } from "framer-motion";
import { Info, Layers, Wind, Droplets } from "lucide-react";

const materials = [
  {
    name: "Heavyweight Denim",
    origin: "Turkey",
    stock: "4,500m",
    property: "Durable",
    icon: <Layers className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600",
    color: "var(--chart-1)"
  },
  {
    name: "Organic Cotton",
    origin: "India",
    stock: "12,200m",
    property: "Breathable",
    icon: <Wind className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1590736962236-121c609f70cd?auto=format&fit=crop&q=80&w=600",
    color: "var(--chart-2)"
  },
  {
    name: "Tech-Nylon",
    origin: "Japan",
    stock: "2,800m",
    property: "Waterproof",
    icon: <Droplets className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1614030424754-24d9e9652033?auto=format&fit=crop&q=80&w=600",
    color: "var(--chart-3)"
  }
];

const QualityThread = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-chart-4 font-black uppercase tracking-[0.2em] text-xs mb-4"
          >
            <Info className="w-4 h-4" />
            <span>Material Intelligence</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Sourced for <br /> <span className="text-muted-foreground">Performance.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Our inventory consists of premium fabrics sourced globally. 
            Real-time stock monitoring ensures no production delays.
          </p>
        </div>

        {/* Interactive Material Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {materials.map((mat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer"
            >
              {/* Background Image */}
              <img 
                src={mat.image} 
                alt={mat.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-80" />

              {/* Content Box */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md bg-white/10 border border-white/20 text-white transition-transform duration-500 group-hover:-translate-y-2"
                  style={{ color: mat.color }}
                >
                  {mat.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{mat.name}</h3>
                
                <div className="flex items-center gap-4 text-white/60 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-white/40 tracking-widest">Origin</span>
                    <span>{mat.origin}</span>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-white/40 tracking-widest">In Stock</span>
                    <span style={{ color: mat.color }}>{mat.stock}</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-chart-2 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QualityThread;