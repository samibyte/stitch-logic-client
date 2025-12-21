import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Eye, Package, ShoppingCart, ArrowUpRight } from "lucide-react";
import type { Product } from "@/pages/AllProducts/AllProducts";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card className="group border-border bg-card hover:shadow-primary/5 relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Image Section */}
        <div className="bg-muted relative aspect-[16/10] overflow-hidden">
          <img
            src={
              product.images[0] ||
              "https://via.placeholder.com/400x300?text=No+Image"
            }
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Badge: Glass effect */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/60 text-foreground border-border/50 font-medium shadow-sm backdrop-blur-md">
              {product.category}
            </Badge>
          </div>

          {/* Hover Overlay Icon */}
          <div className="bg-primary/10 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="bg-background translate-y-4 transform rounded-full p-3 shadow-lg transition-transform duration-300 group-hover:translate-y-0">
              <ArrowUpRight className="text-primary h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Header Section */}
        <CardHeader className="p-5 pb-2">
          <div className="mb-1 flex items-start justify-between gap-2">
            <CardTitle className="group-hover:text-primary line-clamp-1 text-xl font-bold tracking-tight transition-colors">
              {product.name}
            </CardTitle>
          </div>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-foreground text-2xl font-black">
              ${product.price}
            </span>
            <span className="text-muted-foreground text-xs font-medium tracking-tighter uppercase">
              per unit
            </span>
          </div>
          <CardDescription className="text-muted-foreground line-clamp-2 min-h-[40px] text-sm leading-relaxed">
            {product.description}
          </CardDescription>
        </CardHeader>

        {/* Content Section: Inventory Stats */}
        <CardContent className="mt-auto p-5 pt-0">
          <div className="border-border/50 mt-2 mb-5 grid grid-cols-2 gap-3 border-y py-4">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                In Stock
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <ShoppingCart className="text-chart-2 h-4 w-4" />
                {product.availableQuantity} units
              </div>
            </div>
            <div className="border-border/50 flex flex-col gap-1 border-l pl-3">
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                MOQ
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Package className="text-chart-1 h-4 w-4" />
                {product.minOrderQuantity} items
              </div>
            </div>
          </div>

          <Link to={`/products/${product._id}`} className="block w-full">
            <Button
              variant="default"
              className="bg-primary text-primary-foreground h-11 w-full gap-2 rounded-lg font-bold transition-all hover:opacity-90"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
