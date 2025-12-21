import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  DollarSign,
  Package,
  ShoppingCart,
  Plus,
  Minus,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import useUser from "@/hooks/useUser";

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

const AddProduct = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [newImageUrl, setNewImageUrl] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    trigger,
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

  // Watch form values for validation
  const watchAvailableQuantity = getValues("availableQuantity");
  const watchMinOrderQuantity = getValues("minOrderQuantity");
  const watchImages = getValues("images");
  const watchPaymentOptions = getValues("paymentOptions");
  const { dbUser } = useUser();

  useEffect(() => {
    if (dbUser?.status === "suspended") {
      toast.error("Access Denied", {
        description: "Your account is suspended. You cannot add new products.",
      });
      navigate("/dashboard");
    }
  }, [dbUser, navigate]);

  // ... (Your useEffect for validation remains the same)
  useEffect(() => {
    if (watchMinOrderQuantity > watchAvailableQuantity) {
      trigger("minOrderQuantity");
    }
  }, [watchAvailableQuantity, watchMinOrderQuantity, trigger]);
  // Categories based on requirements
  const categories = ["men", "women", "kids", "accessories", "footwear"];

  // Validate MOQ vs Available Quantity
  useEffect(() => {
    if (watchMinOrderQuantity > watchAvailableQuantity) {
      // This will be caught by Zod validation
      trigger("minOrderQuantity");
    }
  }, [watchAvailableQuantity, watchMinOrderQuantity, trigger]);

  const addProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const res = await axiosSecure.post("/products", productData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product added successfully!", {
        description: "Your product is now live and visible in the catalog.",
      });
      navigate("/dashboard/manage-products");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Please try again later");
      } else {
        toast.error("Unknown error occurred");
      }
    },
  });

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    const productToSubmit = data;

    addProductMutation.mutate(productToSubmit);
  };

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

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImageUrl(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newImageUrl.trim()) {
      e.preventDefault();
      handleAddImage();
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
          <CardDescription>
            Create a new product listing. Fill in all required details to add
            the product to your catalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5" />
                Basic Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name / Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Premium Cotton T-Shirt"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Product Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your product in detail..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Required</span>
                  <span>{getValues("description").length}/2000 characters</span>
                </div>
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">
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
                          className={errors.category ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>
                              {cat}
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
                  <Label htmlFor="price">
                    Price ($) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="price"
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
                  <Label htmlFor="availableQuantity">
                    Available Quantity <span className="text-red-500">*</span>
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
                          id="availableQuantity"
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
                  <Label htmlFor="minOrderQuantity">
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
                          id="minOrderQuantity"
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
                  Add image URLs (JPEG, PNG, WebP). First image will be used as
                  the main display.
                </p>

                <div className="mb-4 flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={handleImageUrlChange}
                    onKeyDown={handleKeyDown}
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
                              <Badge variant="secondary" className="text-xs">
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
                <Label htmlFor="demoVideo" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Demo Video Link (Optional)
                </Label>
                <Input
                  id="demoVideo"
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
                  Select payment options <span className="text-red-500">*</span>
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

            {/* Form Actions */}
            <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard/manage-products")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || addProductMutation.isPending}
              >
                {isSubmitting || addProductMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Adding Product...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
