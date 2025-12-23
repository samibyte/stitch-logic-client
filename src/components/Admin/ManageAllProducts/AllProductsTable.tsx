import { useState, useEffect } from "react";
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Trash2,
  Package,
  Tag,
  DollarSign,
  Grid,
  Home,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EditProductModal from "../../Modals/EditProductModal";
import AddProductModal from "./AddProductModal";
import { Badge } from "@/components/ui/badge";

export type PaymentOptions = "COD" | "PayFirst";
export type Category = "men" | "women" | "kids" | "accessories" | "footwear";

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  availableQuantity: number;
  minOrderQuantity: number;
  images: string[];
  demoVideo?: string;
  paymentOptions: string[];
  showOnHome: boolean;
  manager: {
    firebaseUid: string;
    displayName?: string;
    email?: string;
  };
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemsPerPage: number;
}

interface ProductResponse {
  products: Product[];
  pagination: PaginationInfo;
}

const AllProductsTable = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showOnHomeFilter, setShowOnHomeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const res = await axiosSecure.get("/products/categories");
      return res.data;
    },
  });

  const {
    data: productsData = {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
        itemsPerPage: limit,
      },
    },
    isLoading: isProductsLoading,
    isFetching,
  } = useQuery<ProductResponse>({
    queryKey: [
      "products",
      {
        search: debouncedSearchTerm,
        price: priceFilter,
        category: categoryFilter,
        showOnHome: showOnHomeFilter,
        page,
        limit,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (debouncedSearchTerm) params.append("searchText", debouncedSearchTerm);
      if (priceFilter !== "all") params.append("price", priceFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (showOnHomeFilter !== "all")
        params.append("showOnHome", showOnHomeFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await axiosSecure.get(`/products?${params.toString()}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const { products, pagination } = productsData;

  const toggleShowOnHomeMutation = useMutation({
    mutationFn: async ({
      productId,
      showOnHome,
    }: {
      productId: string;
      showOnHome: boolean;
    }) => {
      const res = await axiosSecure.patch(
        `/products/${productId}/show-on-home`,
        {
          showOnHome,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product visibility updated");
    },
    onError: () => {
      toast.error("Failed to update product visibility");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: Partial<Product>) => {
      const res = await axiosSecure.patch(
        `/products/${updatedProduct._id}`,
        updatedProduct,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await axiosSecure.delete(`/products/${productId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  // Table columns updated for Dark Mode
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "images",
      header: "Image",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="border-border bg-muted h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
            {row.images && row.images.length > 0 ? (
              <img
                src={row.images[0]}
                alt={row.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="bg-muted flex h-full w-full items-center justify-center">
                <Package className="text-muted-foreground h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <p className="text-foreground font-medium">{row.name}</p>
            <p className="text-muted-foreground text-xs">
              ID: {row._id.slice(-6)}
            </p>
          </div>
        </div>
      ),
      width: "250px",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: (row) => (
        <div className="text-foreground font-medium">
          ${row.price.toFixed(2)}
          <p className="text-muted-foreground text-xs">
            Stock: {row.availableQuantity}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (row) => (
        <Badge
          variant="outline"
          className="text-foreground border-border capitalize"
        >
          {row.category}
        </Badge>
      ),
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: (row) => (
        <div>
          {row.manager ? (
            <>
              <p className="text-foreground font-medium">
                {row.manager.displayName}
              </p>
              <p className="text-muted-foreground text-xs">
                {row.manager.email}
              </p>
            </>
          ) : (
            <span className="text-muted-foreground">System</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "showOnHome",
      header: "Show on Home",
      cell: (row) => (
        <div className="flex items-center">
          <Switch
            checked={row.showOnHome}
            onCheckedChange={(checked) =>
              handleToggleShowOnHome(row._id, checked)
            }
            disabled={toggleShowOnHomeMutation.isPending}
          />
          <span className="ml-2 text-sm">
            {row.showOnHome ? (
              <span className="flex items-center font-medium text-emerald-500">
                <Eye className="mr-1 h-4 w-4" />
                Showing
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center">
                <EyeOff className="mr-1 h-4 w-4" />
                Hidden
              </span>
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "paymentOptions",
      header: "Payment Mode",
      cell: (row) => {
        const options = row.paymentOptions as string[];
        return (
          <Badge variant="outline" className="text-foreground border-border">
            {options
              .map((opt) => (opt === "PayFirst" ? "Pay first" : "COD"))
              .join(" & ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (row) => (
        <span className="text-foreground">
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  const filters = [
    {
      label: "Category",
      value: categoryFilter,
      options: [
        { value: "all", label: "All Categories" },
        ...categories.map((c) => ({
          value: c,
          label: c.charAt(0).toUpperCase() + c.slice(1),
        })),
      ],
      onValueChange: (value: string) => {
        setCategoryFilter(value);
        setPage(1);
      },
      icon: <Grid className="h-4 w-4" />,
    },
    {
      label: "Price",
      value: priceFilter,
      options: [
        { value: "all", label: "All Prices" },
        { value: "low", label: "Under $50" },
        { value: "medium", label: "$50 - $200" },
        { value: "high", label: "Over $200" },
      ],
      onValueChange: (value: string) => {
        setPriceFilter(value);
        setPage(1);
      },
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: "Home Page",
      value: showOnHomeFilter,
      options: [
        { value: "all", label: "All Products" },
        { value: "true", label: "Show on Home" },
        { value: "false", label: "Not on Home" },
      ],
      onValueChange: (value: string) => {
        setShowOnHomeFilter(value);
        setPage(1);
      },
      icon: <Home className="h-4 w-4" />,
    },
  ];

  const summaryStats = [
    {
      label: "Total Products",
      value: pagination.totalItems,
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: "On Home Page",
      value: products.filter((p: Product) => p.showOnHome).length,
      color: "text-emerald-500",
      icon: <Home className="h-4 w-4" />,
      tooltip: "Products showing on home page",
    },
    {
      label: "Total Value",
      value: `$${products
        .reduce(
          (sum: number, product: Product) =>
            sum + product.price * product.availableQuantity,
          0,
        )
        .toLocaleString()}`,
      color: "text-blue-500",
      icon: <DollarSign className="h-4 w-4" />,
      tooltip: "Total inventory value",
    },
    {
      label: "Categories",
      value: new Set(products.map((p: Product) => p.category)).size,
      color: "text-purple-500",
      icon: <Tag className="h-4 w-4" />,
      tooltip: "Unique categories",
    },
    {
      label: "Page Info",
      value: `${page} / ${pagination.totalPages}`,
      color: "text-muted-foreground",
      icon: <Search className="h-4 w-4" />,
      tooltip: `Showing ${(page - 1) * limit + 1}-${Math.min(
        page * limit,
        pagination.totalItems,
      )} of ${pagination.totalItems} products`,
    },
  ];

  const actions = [
    {
      label: "Edit Product",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: (product: Product) => handleEditProduct(product),
      variant: "outline" as const,
    },
    {
      label: "Delete Product",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: (product: Product) => handleDeleteProduct(product._id),
      variant: "destructive" as const,
      disabled: () => deleteProductMutation.isPending,
    },
  ];

  const handleToggleShowOnHome = async (
    productId: string,
    showOnHome: boolean,
  ) => {
    toggleShowOnHomeMutation.mutate({ productId, showOnHome });
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    const isDark = document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: isDark ? "#27272a" : "#3085d6",
      background: isDark ? "#09090b" : "#fff",
      color: isDark ? "#fafafa" : "#000",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    deleteProductMutation.mutate(productId);
  };

  const handleUpdateProduct = (updatedProduct: Partial<Product>) => {
    updateProductMutation.mutate(updatedProduct);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCategoryFilter("all");
    setPriceFilter("all");
    setShowOnHomeFilter("all");
    setPage(1);
  };

  return (
    <div className="text-foreground bg-background">
      <DataTable
        data={products}
        columns={columns}
        isLoading={isProductsLoading || isFetching}
        searchTerm={searchTerm}
        onSearchChange={(value) => setSearchTerm(value)}
        searchPlaceholder="Search products by name..."
        filters={filters}
        actions={actions}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonLabel="Add Product"
        summaryStats={summaryStats}
        emptyMessage="No products found matching your criteria"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onNextPage: handleNextPage,
          onPrevPage: handlePrevPage,
          onPageChange: handlePageChange,
        }}
        showClearFilters={
          categoryFilter !== "all" ||
          priceFilter !== "all" ||
          showOnHomeFilter !== "all" ||
          searchTerm !== ""
        }
        onClearFilters={handleClearFilters}
        skeletonCount={limit}
      />

      <EditProductModal
        product={selectedProduct}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedProduct(null);
        }}
        onUpdate={handleUpdateProduct}
        isLoading={updateProductMutation.isPending}
      />

      <AddProductModal
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />
    </div>
  );
};

export default AllProductsTable;
