import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Package,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FilterX,
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import ProductCard from "@/components/ProductCard";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  availableQuantity: number;
  minOrderQuantity: number;
  paymentOptions: string[];
  showOnHome: boolean;
  manager: {
    displayName: string;
    email: string;
  };
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    itemsPerPage: number;
  };
}

const AllProducts = () => {
  const axios = useAxios();

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const res = await axios.get("/products/categories");
      return res.data;
    },
  });

  const {
    data: productsData,
    isLoading,
    isPlaceholderData,
    error,
    refetch,
  } = useQuery<ProductsResponse>({
    queryKey: [
      "products",
      page,
      debouncedSearch,
      category,
      priceFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const res = await axios.get("/products", {
        params: {
          page,
          searchText: debouncedSearch,
          category,
          price: priceFilter,
          sortBy,
          sortOrder,
        },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const resetFilters = () => {
    setSearchText("");
    setCategory("all");
    setPriceFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-destructive font-medium">Error loading products.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Marketplace
          </h1>
          <p className="text-muted-foreground">
            Discover quality products from our verified managers.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-border w-fit px-3 py-1 text-sm"
        >
          {productsData?.pagination.totalItems || 0} Total Products
        </Badge>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-muted/40 border-border">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name, category..."
              className="bg-background border-border focus:ring-ring pl-10"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priceFilter}
              onValueChange={(v) => {
                setPriceFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="low">Under $50</SelectItem>
                <SelectItem value="medium">$50 - $200</SelectItem>
                <SelectItem value="high">Over $200</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}:${sortOrder}`}
              onValueChange={(v) => {
                const [field, order] = v.split(":");
                setSortBy(field);
                setSortOrder(order);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="createdAt:desc">Latest</SelectItem>
                <SelectItem value="price:asc">Price: Low to High</SelectItem>
                <SelectItem value="price:desc">Price: High to Low</SelectItem>
                <SelectItem value="name:asc">Name: A-Z</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-primary hover:bg-accent"
            >
              <FilterX className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      {isLoading && !isPlaceholderData ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-muted h-[400px] animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : productsData?.products.length === 0 ? (
        <div className="border-border bg-card/50 rounded-xl border-2 border-dashed py-20 text-center">
          <Package className="text-muted-foreground/50 mx-auto h-12 w-12" />
          <h3 className="text-foreground mt-4 text-lg font-medium">
            No products found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isPlaceholderData ? "opacity-50" : "opacity-100"}`}
        >
          {productsData?.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {productsData && productsData.pagination.totalPages > 1 && (
        <div className="border-border flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            Page {productsData.pagination.currentPage} of{" "}
            {productsData.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-accent"
              disabled={!productsData.pagination.hasPrevPage}
              onClick={() => {
                setPage((p) => p - 1);
                window.scrollTo(0, 0);
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-accent"
              disabled={!productsData.pagination.hasNextPage}
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo(0, 0);
              }}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
