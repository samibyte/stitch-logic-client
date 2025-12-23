import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useMutation } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, User, Phone, MapPin, FileText, Minus, Plus } from "lucide-react";
import axios from "axios";

// Booking form schema
const bookingSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number is too long")
    .trim(),
  deliveryAddress: z.string().min(1, "Delivery address is required").trim(),
  notes: z.string().trim().optional(),
  productId: z.string(),
  productTitle: z.string(),
  productPrice: z.number().min(0),
  paymentOption: z.enum(["COD", "PayFirst"]),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .int("Quantity must be a whole number"),
  orderPrice: z.number().min(0),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    _id: string;
    name: string;
    price: number;
    availableQuantity: number;
    minOrderQuantity: number;
    paymentOptions: string[];
  };
  initialQuantity?: number;
  initialPaymentOption?: "COD" | "PayFirst";
}

const OrderModal = ({
  open,
  onOpenChange,
  product,
  initialQuantity = 1,
  initialPaymentOption = "COD",
}: OrderModalProps) => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [selectedPaymentOption, setSelectedPaymentOption] = useState<
    "COD" | "PayFirst"
  >(initialPaymentOption);
  const [maxQuantity, setMaxQuantity] = useState(product.availableQuantity);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: "",
      lastName: "",
      contactNumber: "",
      deliveryAddress: "",
      notes: "",
      productId: product._id,
      productTitle: product.name,
      productPrice: product.price,
      paymentOption: initialPaymentOption,
      quantity: Math.max(initialQuantity, product.minOrderQuantity),
      orderPrice: 0,
    },
  });

  const watchQuantity = watch("quantity", initialQuantity);
  const watchOrderPrice = watch("orderPrice", 0);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: BookingFormData) => {
      const res = await axiosSecure.post("/orders", {
        buyer: {
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          contactNumber: orderData.contactNumber,
          deliveryAddress: orderData.deliveryAddress,
          notes: orderData.notes || "",
        },
        // Product reference
        productId: orderData.productId,
        paymentOption: orderData.paymentOption,
        quantity: orderData.quantity,
      });
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("lastOrderTrackingId", data.trackingId);

      if (data.paymentOption === "PayFirst" && data.checkoutUrl) {
        toast.info("Redirecting to secure payment...");
        window.location.href = data.checkoutUrl;
      } else {
        toast.success(`Order Placed! ID: ${data.trackingId}`, {
          description: "You can track your order status in your profile.",
          duration: 5000,
        });

        onOpenChange(false);
        reset();
      }
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to place order");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to place order");
      }
    },
  });

  // Initialize form
  useEffect(() => {
    setValue("productId", product._id);
    setValue("productTitle", product.name);
    setValue("productPrice", product.price);
    setValue("paymentOption", selectedPaymentOption);

    // Set max quantity
    setMaxQuantity(product.availableQuantity);

    // Set default quantity
    const defaultQty = Math.max(initialQuantity, product.minOrderQuantity);
    setValue("quantity", defaultQty);

    // Calculate initial price
    const initialPrice = product.price * defaultQty;
    setValue("orderPrice", initialPrice);
  }, [product, initialQuantity, selectedPaymentOption, setValue]);

  // Update order price when quantity changes
  useEffect(() => {
    const price = product.price * watchQuantity;
    setValue("orderPrice", price);
  }, [watchQuantity, product.price, setValue]);

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    const currentQty = getValues("quantity");
    const newQty = Math.max(
      product.minOrderQuantity,
      Math.min(currentQty + delta, maxQuantity),
    );
    setValue("quantity", newQty);
  };

  // Handle payment option change
  const handlePaymentOptionChange = (option: "COD" | "PayFirst") => {
    if (!product.paymentOptions.includes(option)) {
      toast.error(
        `This product does not support ${option === "COD" ? "Cash on Delivery" : "Pay First"}`,
      );
      return;
    }

    setSelectedPaymentOption(option);
    setValue("paymentOption", option);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Handle form submission
  const onSubmit = (data: BookingFormData) => {
    createOrderMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Place Your Order</DialogTitle>
          <DialogDescription>
            Complete the form below to place your order for "{product.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Order Summary</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="font-medium">{formatPrice(product.price)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={watchQuantity <= product.minOrderQuantity}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="min-w-[30px] text-center font-medium">
                      {watchQuantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={watchQuantity >= maxQuantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-gray-500">
                      (Min: {product.minOrderQuantity}, Max: {maxQuantity})
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-blue-600">
                    {formatPrice(watchOrderPrice)}
                  </p>
                </div>
              </div>

              {/* Payment Options */}
              <div>
                <p className="mb-2 text-sm text-gray-500">Payment Method</p>
                <div className="flex flex-wrap gap-2">
                  {product.paymentOptions.map((option: string) => (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant={
                        selectedPaymentOption === option ? "default" : "outline"
                      }
                      onClick={() =>
                        handlePaymentOptionChange(option as "COD" | "PayFirst")
                      }
                      className={
                        selectedPaymentOption === option
                          ? option === "COD"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-green-600 hover:bg-green-700"
                          : ""
                      }
                    >
                      {option === "COD" ? "Cash on Delivery" : "Pay First"}
                    </Button>
                  ))}
                </div>
                {selectedPaymentOption === "PayFirst" && (
                  <p className="mt-2 text-sm text-green-600">
                    Online payment required
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Information</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="mr-2 inline h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  {...register("email")}
                  readOnly={!!user}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  <User className="mr-2 inline h-4 w-4" />
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  <User className="mr-2 inline h-4 w-4" />
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber">
                  <Phone className="mr-2 inline h-4 w-4" />
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactNumber"
                  {...register("contactNumber")}
                  placeholder="+1 (555) 123-4567"
                  className={errors.contactNumber ? "border-red-500" : ""}
                />
                {errors.contactNumber && (
                  <p className="text-sm text-red-500">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">
                <MapPin className="mr-2 inline h-4 w-4" />
                Delivery Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="deliveryAddress"
                {...register("deliveryAddress")}
                placeholder="Street address, city, state, zip code"
                rows={3}
                className={errors.deliveryAddress ? "border-red-500" : ""}
              />
              {errors.deliveryAddress && (
                <p className="text-sm text-red-500">
                  {errors.deliveryAddress.message}
                </p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                <FileText className="mr-2 inline h-4 w-4" />
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any special instructions or notes for your order..."
                rows={3}
              />
            </div>
          </div>

          {/* Hidden fields */}
          <input type="hidden" {...register("productId")} />
          <input type="hidden" {...register("productTitle")} />
          <input type="hidden" {...register("productPrice")} />
          <input type="hidden" {...register("orderPrice")} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOrderMutation.isPending || isSubmitting}
              className="min-w-[120px]"
            >
              {createOrderMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : selectedPaymentOption === "PayFirst" ? (
                "Proceed to Payment"
              ) : (
                "Place Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
