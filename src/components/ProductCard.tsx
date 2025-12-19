import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Badge, Eye, Package, ShoppingCart } from "lucide-react";
import type { Product } from "@/pages/AllProducts/AllProducts";

export default function ProductCard({ product }: { product: Product  }) {
  return (
    <Card className="group hover:border-primary/50 flex h-full flex-col overflow-hidden border-slate-200 transition-colors">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={
            product.images[0] ||
            "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-white/90 text-black hover:bg-white">
            {product.category}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
          <span className="text-primary text-lg font-bold">
            ${product.price}
          </span>
        </div>
        <CardDescription className="line-clamp-2 min-h-[40px]">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto p-4 pt-0">
        <div className="text-muted-foreground mb-4 flex items-center gap-4 border-t pt-4 text-xs">
          <div className="flex items-center gap-1">
            <ShoppingCart className="h-3.5 w-3.5" /> {product.availableQuantity}{" "}
            in stock
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> Min: {product.minOrderQuantity}
          </div>
        </div>
        <Link to={`/products/${product._id}`} className="block w-full">
          <Button className="group-hover:bg-primary w-full">
            <Eye className="mr-2 h-4 w-4" /> View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
