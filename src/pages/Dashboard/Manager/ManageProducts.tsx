import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Filter,
  RefreshCw,
  Package,
  ShoppingCart,
  DollarSign,
  Video,
  Upload,
  X,
  Plus,
  Minus,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

// Zod schema for form validation
const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Product description is required")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Category is required"),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .min(0.01, "Price must be greater than 0"),
  availableQuantity: z
    .number()
    .int("Must be a whole number")
    .positive("Available quantity must be greater than 0"),
  minOrderQuantity: z
    .number()
    .int("Must be a whole number")
    .positive("Minimum order quantity must be greater than 0"),
  images: z
    .array(z.string().url("Invalid URL format"))
    .min(1, "At least one image is required"),
  demoVideo: z.string().url("Invalid URL format").or(z.literal("")),
  paymentOptions: z
    .array(z.enum(["COD", "PayFirst"]))
    .min(1, "At least one payment option is required"),
  showOnHome: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  paymentOptions: string[];
  availableQuantity: number;
  minOrderQuantity: number;
  demoVideo: string;
  showOnHome: boolean;
  createdAt: string;
  updatedAt: string;
}

const ManageProducts = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  // Form state for edit modal
  const [newImageUrl, setNewImageUrl] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      availableQuantity: 1,
      minOrderQuantity: 1,
      images: [],
      demoVideo: "",
      paymentOptions: ["COD", "PayFirst"],
      showOnHome: false,
    },
    mode: "onChange",
  });

  // Fetch products
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", user?.uid],

    queryFn: async () => {
      const res = await axiosSecure.get(`/products/my-products`);
      return res.data;
    },
    enabled: !!user?.uid,
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await axiosSecure.delete(`/products/${productId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
    onSettled: () => {
      setIsLoadingDelete(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const res = await axiosSecure.patch(`/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditDialogOpen(false);
      setEditingProduct(null);
      reset();
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update product",
        );
      } else {
        toast.error("Unknown error occurred");
      }
    },
  });

  // Filter and search products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories
  const categories: string[] = Array.from(
    new Set(products.map((product: Product) => product.category)),
  );

  // Handle delete
  const handleDelete = () => {
    if (productToDelete) {
      setIsLoadingDelete(true);
      deleteMutation.mutate(productToDelete._id);
    }
  };

  // Handle edit modal open
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    // Reset form with product data
    reset({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      availableQuantity: product.availableQuantity,
      minOrderQuantity: product.minOrderQuantity,
      images: product.images,
      demoVideo: product.demoVideo || "",
      paymentOptions: product.paymentOptions as ("COD" | "PayFirst")[],
      showOnHome: product.showOnHome || false,
    });
    setEditDialogOpen(true);
  };

  // Handle edit form submission
  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data });
    }
  };

  // Form helper functions
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      try {
        const url = new URL(newImageUrl.trim());
        const currentImages = getValues("images");
        setValue("images", [...currentImages, url.toString()], {
          shouldValidate: true,
        });
        setNewImageUrl("");
      } catch {
        toast.error("Please enter a valid image URL");
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = getValues("images");
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    setValue("images", newImages, { shouldValidate: true });

    if (previewIndex === index) {
      setPreviewIndex(null);
    }
  };

  const handlePaymentOptionToggle = (option: "COD" | "PayFirst") => {
    const currentOptions = getValues("paymentOptions");
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter((opt) => opt !== option)
      : [...currentOptions, option];

    setValue("paymentOptions", newOptions, { shouldValidate: true });
  };

  const handleQuantityChange = (
    field: "availableQuantity" | "minOrderQuantity",
    delta: number,
  ) => {
    const currentValue = getValues(field);
    const newValue = Math.max(1, currentValue + delta);
    setValue(field, newValue, { shouldValidate: true });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Get payment mode badge
  const getPaymentModeBadge = (paymentOptions: string[]) => {
    if (paymentOptions.includes("COD") && paymentOptions.includes("PayFirst")) {
      return <Badge variant="outline">Both</Badge>;
    } else if (paymentOptions.includes("COD")) {
      return <Badge variant="outline">COD</Badge>;
    } else if (paymentOptions.includes("PayFirst")) {
      return <Badge variant="outline">Pay First</Badge>;
    }
    return <Badge variant="outline">N/A</Badge>;
  };

  // Watch form values
  const watchImages = getValues("images");
  const watchPaymentOptions = getValues("paymentOptions");

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
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-2xl font-bold">
                Manage Products
              </CardTitle>
              <CardDescription>
                View and manage all your products in one place
              </CardDescription>
            </div>
            <Button onClick={() => navigate("/dashboard/add-product")}>
              Add New Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products by name, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border-input bg-background ring-offset-background focus:ring-ring h-10 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category, i) => (
                    <option key={i} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>

          {/* Products Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-8 text-center">
              {searchQuery || selectedCategory !== "all" ? (
                <>
                  <p className="text-gray-500">
                    No products match your search criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-500">
                    You haven't added any products yet.
                  </p>
                  <Button
                    className="mt-2"
                    onClick={() => navigate("/dashboard/add-product")}
                  >
                    Add Your First Product
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: Product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/64?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="line-clamp-1 text-sm text-gray-500">
                            {product.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>
                        {getPaymentModeBadge(product.paymentOptions)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.category.charAt(0).toUpperCase() +
                            product.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {product.availableQuantity} units
                          </div>
                          <div className="text-gray-500">
                            MOQ: {product.minOrderQuantity}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/products/${product._id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditClick(product)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setProductToDelete(product);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete "
                  {productToDelete?.name}" from your products.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoadingDelete}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isLoadingDelete}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isLoadingDelete ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Edit Product Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update the product details below.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="edit-name">
                      Product Name / Title{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      {...register("name")}
                      placeholder="e.g., Premium Cotton T-Shirt"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">
                      Product Description{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="edit-description"
                      {...register("description")}
                      placeholder="Describe your product in detail..."
                      rows={4}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Required</span>
                      <span>
                        {getValues("description").length}/2000 characters
                      </span>
                    </div>
                    {errors.description && (
                      <p className="text-sm text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={
                                errors.category ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat.toLowerCase()}>
                                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.category && (
                        <p className="text-sm text-red-500">
                          {errors.category.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-price">
                        Price ($) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Controller
                          name="price"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="edit-price"
                              type="number"
                              step="0.01"
                              min="0.01"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                field.onChange(value);
                              }}
                              placeholder="0.00"
                              className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                            />
                          )}
                        />
                      </div>
                      {errors.price && (
                        <p className="text-sm text-red-500">
                          {errors.price.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <ShoppingCart className="h-5 w-5" />
                    Quantity Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-availableQuantity">
                        Available Quantity{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleQuantityChange("availableQuantity", -1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Controller
                          name="availableQuantity"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="edit-availableQuantity"
                              type="number"
                              min="1"
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                field.onChange(value);
                              }}
                              className={`text-center ${errors.availableQuantity ? "border-red-500" : ""}`}
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleQuantityChange("availableQuantity", 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.availableQuantity && (
                        <p className="text-sm text-red-500">
                          {errors.availableQuantity.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-minOrderQuantity">
                        Minimum Order Quantity (MOQ){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleQuantityChange("minOrderQuantity", -1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Controller
                          name="minOrderQuantity"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="edit-minOrderQuantity"
                              type="number"
                              min="1"
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                field.onChange(value);
                              }}
                              className={`text-center ${errors.minOrderQuantity ? "border-red-500" : ""}`}
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleQuantityChange("minOrderQuantity", 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.minOrderQuantity && (
                        <p className="text-sm text-red-500">
                          {errors.minOrderQuantity.message}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Customers must order at least this quantity
                      </p>
                    </div>
                  </div>
                </div>

                {/* Media Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <ImageIcon className="h-5 w-5" />
                    Media
                  </h3>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>
                      Product Images <span className="text-red-500">*</span>
                    </Label>
                    <p className="mb-2 text-sm text-gray-500">
                      Add image URLs (JPEG, PNG, WebP). First image will be used
                      as the main display.
                    </p>

                    <div className="mb-4 flex gap-2">
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newImageUrl.trim()) {
                            e.preventDefault();
                            handleAddImage();
                          }
                        }}
                        placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddImage}
                        variant="secondary"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>

                    {errors.images && (
                      <p className="mb-2 text-sm text-red-500">
                        {errors.images.message}
                      </p>
                    )}

                    {/* Image Preview Grid */}
                    {watchImages.length > 0 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                          {watchImages.map((url, index) => (
                            <div key={index} className="group relative">
                              <div
                                className={`relative h-32 w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                                  previewIndex === index
                                    ? "ring-opacity-50 border-blue-500 ring-2 ring-blue-500"
                                    : "border-gray-200 hover:border-blue-300"
                                }`}
                                onClick={() =>
                                  setPreviewIndex(
                                    previewIndex === index ? null : index,
                                  )
                                }
                              >
                                <img
                                  src={url}
                                  alt={`Product image ${index + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/150?text=Invalid+URL";
                                  }}
                                />
                                <div className="absolute top-2 right-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {index + 1}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Large Image Preview */}
                        {previewIndex !== null && watchImages[previewIndex] && (
                          <div className="relative rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium">
                                Preview: Image {previewIndex + 1}
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreviewIndex(null)}
                              >
                                <EyeOff className="mr-2 h-4 w-4" />
                                Close Preview
                              </Button>
                            </div>
                            <div className="flex justify-center">
                              <img
                                src={watchImages[previewIndex]}
                                alt={`Preview ${previewIndex + 1}`}
                                className="max-h-96 max-w-full rounded-md object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/600x400?text=Invalid+URL";
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Demo Video */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-demoVideo"
                      className="flex items-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Demo Video Link (Optional)
                    </Label>
                    <Input
                      id="edit-demoVideo"
                      type="url"
                      {...register("demoVideo")}
                      placeholder="https://youtube.com/embed/..."
                    />
                    {errors.demoVideo && (
                      <p className="text-sm text-red-500">
                        {errors.demoVideo.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Link to a video demonstrating your product
                    </p>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Options</h3>
                  <div className="space-y-2">
                    <Label>
                      Select payment options{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    {errors.paymentOptions && (
                      <p className="text-sm text-red-500">
                        {errors.paymentOptions.message}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div
                        className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
                          watchPaymentOptions.includes("COD")
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handlePaymentOptionToggle("COD")}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full p-2 ${
                              watchPaymentOptions.includes("COD")
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-500">
                              Pay when you receive
                            </p>
                          </div>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border-2 ${
                            watchPaymentOptions.includes("COD")
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        />
                      </div>

                      <div
                        className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
                          watchPaymentOptions.includes("PayFirst")
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handlePaymentOptionToggle("PayFirst")}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full p-2 ${
                              watchPaymentOptions.includes("PayFirst")
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Pay First</p>
                            <p className="text-sm text-gray-500">
                              Pay before delivery
                            </p>
                          </div>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border-2 ${
                            watchPaymentOptions.includes("PayFirst")
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditDialogOpen(false);
                      setEditingProduct(null);
                      reset();
                    }}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      "Update Product"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageProducts;
