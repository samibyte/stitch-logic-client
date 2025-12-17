import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  User,
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Minus,
  Plus,
} from "lucide-react";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import useGetRole from "@/hooks/useGetRole";
import OrderModal from "@/components/Modals/OrderModal";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const { role } = useGetRole();

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<
    "COD" | "PayFirst"
  >("COD");
  const [maxQuantity, setMaxQuantity] = useState(0);

  // Fetch product details
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Initialize product data
  useEffect(() => {
    if (!product) return;

    const id = setTimeout(() => {
      const defaultPaymentOption = product.paymentOptions.includes("COD")
        ? "COD"
        : "PayFirst";
      setSelectedPaymentOption(defaultPaymentOption);
      setMaxQuantity(product.availableQuantity);
      setSelectedQuantity(Math.max(1, product.minOrderQuantity));
    }, 0);

    return () => clearTimeout(id);
  }, [product]);

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    if (!product) return;

    const newQty = Math.max(
      product.minOrderQuantity,
      Math.min(selectedQuantity + delta, maxQuantity),
    );
    setSelectedQuantity(newQty);
  };

  // Handle payment option change
  const handlePaymentOptionChange = (option: "COD" | "PayFirst") => {
    if (!product?.paymentOptions.includes(option)) {
      toast.error(
        `This product does not support ${option === "COD" ? "Cash on Delivery" : "Pay First"}`,
      );
      return;
    }
    setSelectedPaymentOption(option);
  };

  // Check if user can place order
  const canPlaceOrder = user && role !== "admin" && role !== "manager";

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate order price
  const orderPrice = product ? product.price * selectedQuantity : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500">Failed to load product details.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column - Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative overflow-hidden rounded-lg border bg-gray-100">
            {product.images[selectedImageIndex] ? (
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="h-[400px] w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/600x400?text=No+Image";
                }}
              />
            ) : (
              <div className="flex h-[400px] items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {/* Featured Badge */}
            {product.showOnHome && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-600">Featured</Badge>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative overflow-hidden rounded-lg border transition-all ${
                    selectedImageIndex === index
                      ? "ring-2 ring-blue-500"
                      : "hover:border-blue-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Product thumbnail ${index + 1}`}
                    className="h-20 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/100?text=Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
                </button>
              ))}
            </div>
          )}

          {/* Demo Video */}
          {product.demoVideo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                <h3 className="font-semibold">Demo Video</h3>
              </div>
              <div className="aspect-video overflow-hidden rounded-lg border">
                <iframe
                  src={product.demoVideo}
                  title="Product Demo Video"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-6">
          {/* Product Header */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="mt-2 flex items-center gap-3">
                  <Badge variant="outline">{product.category}</Badge>
                  <span className="text-sm text-gray-500">
                    Listed {formatDate(product.createdAt)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-gray-500">per unit</div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="mt-4 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                Sold by{" "}
                <span className="font-medium">{product.manager.name}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="whitespace-pre-line text-gray-600">
              {product.description}
            </p>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Available Quantity</span>
              </div>
              <p className="text-2xl font-bold">
                {product.availableQuantity} units
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Minimum Order (MOQ)</span>
              </div>
              <p className="text-2xl font-bold">
                {product.minOrderQuantity} units
              </p>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Payment Options</h3>
            <div className="flex flex-wrap gap-2">
              {product.paymentOptions.map((option: string) => (
                <Button
                  key={option}
                  type="button"
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
          </div>

          {/* Order Button */}
          <div className="border-t pt-6">
            {canPlaceOrder ? (
              <div className="space-y-4">
                {product.availableQuantity > 0 ? (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">Select Quantity:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={
                            selectedQuantity <= product.minOrderQuantity
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[40px] text-center font-semibold">
                          {selectedQuantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(1)}
                          disabled={selectedQuantity >= maxQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-500">
                          (Min: {product.minOrderQuantity}, Max: {maxQuantity})
                        </span>
                      </div>
                    </div>

                    <div className="text-lg">
                      <span className="text-gray-600">Total: </span>
                      <span className="font-bold text-blue-600">
                        {formatPrice(orderPrice)}
                      </span>
                    </div>

                    <Button
                      onClick={() => setShowBookingDialog(true)}
                      className="w-full py-6 text-lg"
                      size="lg"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Place Order
                    </Button>
                  </>
                ) : (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Out of Stock</span>
                    </div>
                    <p className="mt-1 text-sm text-red-600">
                      This product is currently unavailable.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Sign in to Order</span>
                </div>
                <p className="mt-1 text-sm text-blue-600">
                  {!user
                    ? "Please sign in to place an order."
                    : "This feature is not available for admin/manager accounts."}
                </p>
                {!user && (
                  <Button
                    onClick={() => navigate("/login")}
                    className="mt-3"
                    variant="outline"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Booking Modal */}
      {product && (
        <OrderModal
          open={showBookingDialog}
          onOpenChange={setShowBookingDialog}
          product={product}
          initialQuantity={selectedQuantity}
          initialPaymentOption={selectedPaymentOption}
        />
      )}
    </div>
  );
};

export default ProductDetails;
