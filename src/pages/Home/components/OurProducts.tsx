import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Box } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/pages/AllProducts/AllProducts";
import useAxios from "@/hooks/useAxios";

const OurProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const axios = useAxios();

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const response = await axios.get("/products/home");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching home products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  return (
    <section className="bg-background py-24">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-chart-1 mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase"
            >
              <Box className="h-4 w-4" />
              <span>Featured Collection</span>
            </motion.div>
            <h2 className="text-foreground text-4xl font-black tracking-tight md:text-5xl">
              Premium Production <br />{" "}
              <span className="text-muted-foreground">Catalog.</span>
            </h2>
          </div>

          <Link to="/all-products">
            <Button
              variant="outline"
              className="group border-border hover:bg-accent h-12 px-6 font-bold"
            >
              Explore All Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Grid Logic */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-muted border-border h-[450px] animate-pulse rounded-xl border"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="border-border rounded-2xl border-2 border-dashed py-20 text-center">
            <p className="text-muted-foreground font-medium">
              No products found for the home section.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default OurProducts;
