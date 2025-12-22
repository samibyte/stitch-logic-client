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

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products with server-side filtering
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

  // Toggle Show on Home mutation
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

  // Update product mutation
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

  // Delete product mutation
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

  // Table columns
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "images",
      header: "Image",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
            {row.images && row.images.length > 0 ? (
              <img
                src={row.images[0]}
                alt={row.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">ID: {row._id.slice(-6)}</p>
          </div>
        </div>
      ),
      width: "250px",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: (row) => (
        <div className="font-medium">
          ${row.price.toFixed(2)}
          <p className="text-xs text-gray-500">
            Stock: {row.availableQuantity}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
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
              <p className="font-medium">{row.manager.displayName}</p>
              <p className="text-xs text-gray-500">{row.manager.email}</p>
            </>
          ) : (
            <span className="text-gray-500">System</span>
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
              <span className="flex items-center text-green-600">
                <Eye className="mr-1 h-4 w-4" />
                Showing
              </span>
            ) : (
              <span className="flex items-center text-gray-500">
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
          <Badge variant="outline">
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
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
  ];

  // Filters
  const filters = [
    {
      label: "Category",
      value: categoryFilter,
      options: [
        { value: "all", label: "All Categories" },
        { value: "men", label: "Men's Wear" },
        { value: "women", label: "Women's Wear" },
        { value: "kids", label: "Kids' Wear" },
        { value: "accessories", label: "Accessories" },
        { value: "footwear", label: "Footwear" },
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

  // Summary stats
  const summaryStats = [
    {
      label: "Total Products",
      value: pagination.totalItems,
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: "On Home Page",
      value: products.filter((p: Product) => p.showOnHome).length,
      color: "text-green-600",
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
      color: "text-blue-600",
      icon: <DollarSign className="h-4 w-4" />,
      tooltip: "Total inventory value",
    },
    {
      label: "Categories",
      value: new Set(products.map((p: Product) => p.category)).size,
      color: "text-purple-600",
      icon: <Tag className="h-4 w-4" />,
      tooltip: "Unique categories",
    },
    {
      label: "Page Info",
      value: `${page} / ${pagination.totalPages}`,
      color: "text-gray-600",
      icon: <Search className="h-4 w-4" />,
      tooltip: `Showing ${(page - 1) * limit + 1}-${Math.min(
        page * limit,
        pagination.totalItems,
      )} of ${pagination.totalItems} products`,
    },
  ];

  // Table actions
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

  // Handlers
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
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This action cannot be undone! All associated data will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
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

  // Pagination handlers
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

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCategoryFilter("all");
    setPriceFilter("all");
    setShowOnHomeFilter("all");
    setPage(1);
  };

  return (
    <div>
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
        // Pagination props
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onNextPage: handleNextPage,
          onPrevPage: handlePrevPage,
          onPageChange: handlePageChange,
        }}
        // Clear filters button
        showClearFilters={
          categoryFilter !== "all" ||
          priceFilter !== "all" ||
          showOnHomeFilter !== "all" ||
          searchTerm !== ""
        }
        onClearFilters={handleClearFilters}
        // Loading state
        skeletonCount={limit}
      />

      {/* Edit Product Modal */}
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

      {/* Add Product Modal */}
      <AddProductModal
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />
    </div>
  );
};

export default AllProductsTable;
