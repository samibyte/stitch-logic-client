import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Plus } from "lucide-react";
import type { Product } from "../Manager/ManageProducts/ManageProductsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for validation
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be greater than 0"),
  availableQuantity: z.number().int().min(0, "Quantity cannot be negative"),
  minOrderQuantity: z.number().int().min(1, "Minimum order must be at least 1"),
  images: z
    .array(z.string().url("Invalid URL format"))
    .min(1, "At least one image is required"),
  demoVideo: z.string().url("Invalid URL format").or(z.literal("")).optional(),
  paymentOptions: z
    .array(z.enum(["COD", "PayFirst"]))
    .min(1, "At least one payment option is required"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (product: Partial<Product>) => void;
  isLoading: boolean;
}

const EditProductModal = ({
  product,
  isOpen,
  onClose,
  isLoading,
  onUpdate,
}: EditProductModalProps) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      availableQuantity: 0,
      minOrderQuantity: 1,
      images: [],
      demoVideo: "",
      paymentOptions: [],
    },
  });

  // Watch form values
  const images = watch("images");
  const paymentOptions = watch("paymentOptions");
  const availableQuantity = watch("availableQuantity");
  const minOrderQuantity = watch("minOrderQuantity");

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        availableQuantity: product.availableQuantity,
        minOrderQuantity: product.minOrderQuantity,
        images: product.images || [],
        demoVideo: product.demoVideo || "",
        paymentOptions:
          (product.paymentOptions as ("COD" | "PayFirst")[]) || [],
      });
    }
  }, [product, reset]);

  const [newImage, setNewImage] = useState("");

  const handleAddImage = () => {
    if (newImage.trim() && !images.includes(newImage.trim())) {
      setValue("images", [...images, newImage.trim()], {
        shouldValidate: true,
      });
      setNewImage("");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setValue("images", newImages, { shouldValidate: true });
  };

  const handleTogglePaymentOption = (option: "COD" | "PayFirst") => {
    const newOptions = paymentOptions.includes(option)
      ? paymentOptions.filter((opt) => opt !== option)
      : [...paymentOptions, option];
    setValue("paymentOptions", newOptions, { shouldValidate: true });
  };

  const onSubmit = (data: ProductFormData) => {
    if (!product?._id) return;

    onUpdate({
      ...data,
      _id: product._id,
    });
  };

  const handleMinOrderChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    if (availableQuantity && numValue > availableQuantity) {
      return; // Don't update if greater than available quantity
    }
    setValue("minOrderQuantity", numValue, { shouldValidate: true });
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product: {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      className={errors.price ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableQuantity">Available Quantity</Label>
                <Controller
                  name="availableQuantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="availableQuantity"
                      type="number"
                      min="0"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      className={
                        errors.availableQuantity ? "border-red-500" : ""
                      }
                    />
                  )}
                />
                {errors.availableQuantity && (
                  <p className="text-sm text-red-500">
                    {errors.availableQuantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrderQuantity">Minimum Order Quantity</Label>
                <Controller
                  name="minOrderQuantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="minOrderQuantity"
                      type="number"
                      min="1"
                      max={availableQuantity}
                      value={field.value}
                      onChange={(e) => handleMinOrderChange(e.target.value)}
                      className={
                        errors.minOrderQuantity ? "border-red-500" : ""
                      }
                    />
                  )}
                />
                {errors.minOrderQuantity && (
                  <p className="text-sm text-red-500">
                    {errors.minOrderQuantity.message}
                  </p>
                )}
                {minOrderQuantity > availableQuantity && (
                  <p className="text-sm text-red-500">
                    Min order cannot exceed available quantity
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value: string) => field.onChange(value)}
                  >
                    <SelectTrigger
                      className={errors.category ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men's</SelectItem>
                      <SelectItem value="women">Women's</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="footwear">Footwear</SelectItem>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={3}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <div className="flex gap-2">
                <Input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Enter image URL"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newImage.trim()) {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddImage}
                  variant="secondary"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.images && (
                <p className="text-sm text-red-500">{errors.images.message}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {images?.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="h-16 w-16 overflow-hidden rounded border">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/64?text=Invalid+URL";
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Options</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    paymentOptions.includes("COD") ? "default" : "outline"
                  }
                  onClick={() => handleTogglePaymentOption("COD")}
                >
                  COD
                </Button>
                <Button
                  type="button"
                  variant={
                    paymentOptions.includes("PayFirst") ? "default" : "outline"
                  }
                  onClick={() => handleTogglePaymentOption("PayFirst")}
                >
                  Pay First
                </Button>
              </div>
              {errors.paymentOptions && (
                <p className="text-sm text-red-500">
                  {errors.paymentOptions.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="demoVideo">Demo Video URL (Optional)</Label>
              <Input
                id="demoVideo"
                type="url"
                {...register("demoVideo")}
                placeholder="https://example.com/video.mp4"
                className={errors.demoVideo ? "border-red-500" : ""}
              />
              {errors.demoVideo && (
                <p className="text-sm text-red-500">
                  {errors.demoVideo.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
