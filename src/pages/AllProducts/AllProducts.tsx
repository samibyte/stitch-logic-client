import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ShoppingCart,
  DollarSign,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";

interface Product {
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
  createdAt: string;
  updatedAt: string;
  manager: {
    firebaseUid: string;
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

  // State for filters
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);

  // Fetch unique categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<
    string[]
  >({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const res = await axios.get<string[]>("/products/categories");
      return res.data;
    },
  });

  // Build query params
  const buildQueryParams = () => {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (debouncedSearch) params.searchText = debouncedSearch;
    if (category && category !== "all") params.category = category;
    if (priceFilter && priceFilter !== "all") params.price = priceFilter;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    return params;
  };

  // Fetch products with filters
  const {
    data: productsData,
    isLoading: productsLoading,
    error,
    refetch,
  } = useQuery<ProductsResponse>({
    queryKey: [
      "all-products",
      page,
      limit,
      debouncedSearch,
      category,
      priceFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = buildQueryParams();
      const res = await axios.get("/products", { params });
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Reset page when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [category, priceFilter, limit]);

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, order] = value.split(":");
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchText("");
    setCategory("all");
    setPriceFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  // Handle page navigation
  const goToPage = (pageNum: number) => {
    setPage(pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if any filter is active
  const isFilterActive = () => {
    return (
      searchText !== "" ||
      category !== "all" ||
      priceFilter !== "all" ||
      sortBy !== "createdAt" ||
      sortOrder !== "desc"
    );
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500">
              Failed to load products. Please try again.
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Main Products Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-2xl font-bold">All Products</CardTitle>
              <CardDescription>
                Browse through all available products
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              {productsData?.pagination?.totalItems || 0} products total
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters and Search */}
          <div className="mb-8 flex flex-col justify-between gap-4 space-y-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Category Filter */}
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {!categoriesLoading &&
                    categories.map((cat: string) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under $50</SelectItem>
                  <SelectItem value="medium">$50 - $200</SelectItem>
                  <SelectItem value="high">Over $200</SelectItem>
                </SelectContent>
              </Select>
              {/* Sort Order */}
              <Select
                value={`${sortBy}:${sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Newest First</SelectItem>
                  <SelectItem value="createdAt:asc">Oldest First</SelectItem>
                  <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price:asc">Price: Low to High</SelectItem>
                  <SelectItem value="price:desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Items per page */}
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 per page</SelectItem>
                  <SelectItem value="9">9 per page</SelectItem>
                  <SelectItem value="12">12 per page</SelectItem>
                  <SelectItem value="24">24 per page</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={resetFilters}
                disabled={!isFilterActive()}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          ) : productsData?.products.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">
                No products found matching your criteria.
              </p>
              {isFilterActive() && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {productsData?.products.map((product: Product) => (
                  <Card
                    key={product._id}
                    className="overflow-hidden transition-all hover:shadow-lg"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x300?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 space-y-1">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 backdrop-blur-sm"
                        >
                          {product.category}
                        </Badge>
                        {product.showOnHome && (
                          <Badge className="bg-blue-500/90 backdrop-blur-sm">
                            On Homepage
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Product Name */}
                      <h3 className="mb-2 line-clamp-1 text-lg font-semibold">
                        {product.name}
                      </h3>

                      {/* Product Description */}
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {product.description}
                      </p>

                      {/* Product Info Grid */}
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        {/* Price */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <DollarSign className="h-3 w-3" />
                            <span>Price</span>
                          </div>
                          <p className="font-semibold text-blue-600">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        {/* Available Quantity */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <ShoppingCart className="h-3 w-3" />
                            <span>Available</span>
                          </div>
                          <p className="font-semibold">
                            {product.availableQuantity} units
                          </p>
                        </div>

                        {/* Minimum Order Quantity */}
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">MOQ</div>
                          <p className="font-medium">
                            {product.minOrderQuantity} units
                          </p>
                        </div>

                        {/* Payment Options */}
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Payment</div>
                          <div className="flex flex-wrap gap-1">
                            {product.paymentOptions.map((option) => (
                              <Badge
                                key={option}
                                variant="outline"
                                className="text-xs"
                              >
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Seller Info */}
                      <div className="mb-4 border-t pt-4">
                        <p className="text-xs text-gray-500">Sold by</p>
                        <p className="text-sm font-medium">
                          {product.manager.displayName}
                        </p>
                      </div>

                      {/* View Details Button */}
                      <Link to={`/products/${product._id}`}>
                        <Button className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {productsData?.pagination && (
                <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    {Math.min(
                      productsData.pagination.itemsPerPage * (page - 1) + 1,
                      productsData.pagination.totalItems,
                    )}
                    -
                    {Math.min(
                      productsData.pagination.itemsPerPage * page,
                      productsData.pagination.totalItems,
                    )}{" "}
                    of {productsData.pagination.totalItems} products
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(page - 1)}
                      disabled={!productsData.pagination.hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from(
                      { length: productsData.pagination.totalPages },
                      (_, i) => i + 1,
                    )
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === productsData.pagination.totalPages ||
                          (p >= page - 1 && p <= page + 1),
                      )
                      .map((pageNum, index, array) => {
                        // Add ellipsis for gaps
                        const prev = array[index - 1];
                        if (prev && pageNum - prev > 1) {
                          return (
                            <span key={`ellipsis-${pageNum}`} className="px-2">
                              ...
                            </span>
                          );
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? "default" : "outline"}
                            size="icon"
                            onClick={() => goToPage(pageNum)}
                            className="h-10 w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(page + 1)}
                      disabled={!productsData.pagination.hasNextPage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllProducts;
