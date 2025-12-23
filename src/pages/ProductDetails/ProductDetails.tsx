import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  User,
  AlertCircle,
  ArrowLeft,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Share2,
  CreditCard,
  Banknote,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAuth from "@/hooks/useAuth";
import useGetRole from "@/hooks/useGetRole";
import OrderModal from "@/components/Modals/OrderModal";
import DetailsSkeleton from "./DetailsSkeleton";
import useUser from "@/hooks/useUser";

type PaymentMethod = "COD" | "PayFirst";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const { role } = useGetRole();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPaymentOption, setSelectedPaymentOption] =
    useState<PaymentMethod>("COD");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

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

  useEffect(() => {
    if (!product) return;
    const hasCOD = product.paymentOptions?.includes("COD");
    const defaultPayment = hasCOD ? "COD" : "PayFirst";
    setSelectedPaymentOption(defaultPayment);
    setSelectedQuantity(product.minOrderQuantity || 1);
  }, [product]);

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQty = selectedQuantity + delta;
    if (
      newQty >= product.minOrderQuantity &&
      newQty <= product.availableQuantity
    ) {
      setSelectedQuantity(newQty);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const { dbUser } = useUser();
  const isSuspended = dbUser?.status === "suspended";
  const canPlaceOrder = user && !["admin", "manager"].includes(role);
  const isOutOfStock = product?.availableQuantity === 0;

  if (isLoading) return <DetailsSkeleton />;

  if (error || !product) {
    return (
      <div className="bg-background flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="text-destructive h-12 w-12" />
        <h2 className="text-foreground text-xl font-semibold">
          Product not found
        </h2>
        <Button onClick={() => navigate("/all-products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  const orderPrice = product.price * selectedQuantity;

  return (
    <div className="animate-in fade-in bg-background container mx-auto max-w-7xl px-4 py-8 pb-28 duration-500">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Link
            to="/all-products"
            className="hover:text-primary transition-colors"
          >
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          {/* Main Gallery */}
          <div className="space-y-4">
            <div className="border-border bg-muted/30 relative aspect-square w-full overflow-hidden rounded-xl border md:aspect-4/3">
              <img
                src={
                  product.images[selectedImageIndex] ||
                  "https://via.placeholder.com/600?text=No+Image"
                }
                alt={product.name}
                className="h-full w-full object-contain p-4 transition-transform duration-500 hover:scale-105"
              />
              {product.showOnHome && (
                <Badge className="bg-primary text-primary-foreground absolute top-4 left-4 shadow-sm">
                  Featured
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-primary ring-primary/20 ring-2"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt="thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="border-border w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="description"
                className="data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="video"
                disabled={!product.demoVideo}
                className="data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Video Demo
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Shipping & Returns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="bg-muted/50 border-border rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Category
                  </p>
                  <p className="text-foreground font-medium capitalize">
                    {product.category}
                  </p>
                </div>
                <div className="bg-muted/50 border-border rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Stock
                  </p>
                  <p className="text-foreground font-medium">
                    {product.availableQuantity} units
                  </p>
                </div>
                <div className="bg-muted/50 border-border rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Seller
                  </p>
                  <p className="text-foreground font-medium">
                    {product.manager?.displayName || "Official Store"}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video" className="mt-6">
              {product.demoVideo ? (
                <div className="border-border aspect-video overflow-hidden rounded-xl border bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(product.demoVideo)}
                    title="Product Demo"
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">No video available.</p>
              )}
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <div className="text-muted-foreground space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Truck className="text-chart-1 h-5 w-5" />
                  <div>
                    <p className="text-foreground font-medium">
                      Standard Shipping
                    </p>
                    <p>Delivery in 3-5 business days.</p>
                  </div>
                </div>
                <Separator className="bg-border" />
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-chart-2 h-5 w-5" />
                  <div>
                    <p className="text-foreground font-medium">
                      Warranty Protection
                    </p>
                    <p>Verified seller with 30-day protection policy.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5">
          <Card className="border-border bg-card sticky top-6 overflow-hidden shadow-lg">
            <CardHeader className="bg-muted/30 border-border border-b pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-foreground text-2xl font-bold tracking-tight">
                    {product.name}
                  </h1>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground font-normal"
                    >
                      {product.category}
                    </Badge>
                    {isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-chart-2/30 bg-chart-2/10 text-chart-2"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" /> In Stock
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div>
                <span className="text-primary text-4xl font-bold">
                  {formatPrice(product.price)}
                </span>
                <span className="text-muted-foreground ml-2 text-sm">
                  / unit
                </span>
              </div>
              <Separator className="bg-border" />

              {/* Quantity */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-foreground text-sm font-medium">
                    Quantity
                  </label>
                  <span className="text-muted-foreground text-xs">
                    Min Order: {product.minOrderQuantity}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="border-border bg-background flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={
                        selectedQuantity <= product.minOrderQuantity ||
                        isOutOfStock
                      }
                      className="border-border h-10 w-10 rounded-r-none border-r"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-foreground flex h-10 w-16 items-center justify-center text-center font-semibold">
                      {selectedQuantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={
                        selectedQuantity >= product.availableQuantity ||
                        isOutOfStock
                      }
                      className="border-border h-10 w-10 rounded-l-none border-l"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {product.availableQuantity} available
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-3">
                <label className="text-foreground text-sm font-medium">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Cash on Delivery Button */}
                  <button
                    type="button"
                    onClick={() =>
                      product.paymentOptions.includes("COD") &&
                      setSelectedPaymentOption("COD")
                    }
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-all ${
                      product.paymentOptions.includes("COD")
                        ? "cursor-pointer border-emerald-500/30 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10"
                        : "border-border bg-muted/20 text-muted-foreground/50 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="relative">
                      <Banknote className="h-5 w-5" />
                      {product.paymentOptions.includes("COD") && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold tracking-tighter uppercase">
                      Cash on Delivery
                    </span>
                  </button>

                  {/* Online Payment Button */}
                  <button
                    type="button"
                    onClick={() =>
                      product.paymentOptions.includes("PayFirst") &&
                      setSelectedPaymentOption("PayFirst")
                    }
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-all ${
                      product.paymentOptions.includes("PayFirst")
                        ? "cursor-pointer border-emerald-500/30 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10"
                        : "border-border bg-muted/20 text-muted-foreground/50 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="relative">
                      <CreditCard className="h-5 w-5" />
                      {product.paymentOptions.includes("PayFirst") && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold tracking-tighter uppercase">
                      Online Payment
                    </span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/40 border-border space-y-2 rounded-lg border p-4">
                <div className="text-muted-foreground flex justify-between text-sm">
                  <span>Subtotal ({selectedQuantity} items)</span>
                  <span>{formatPrice(orderPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-chart-2 font-medium">Free</span>
                </div>
                <Separator className="bg-border my-2" />
                <div className="text-foreground flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(orderPrice)}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3 pt-2">
              {!canPlaceOrder || isSuspended ? (
                <div className="border-chart-4/30 bg-chart-4/10 text-chart-4 w-full rounded-md border p-3 text-center text-sm font-medium">
                  {isSuspended
                    ? "Suspended users cannot place orders."
                    : !canPlaceOrder
                      ? "Admin/Managers cannot place orders."
                      : "Please sign in to purchase."}
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full text-lg shadow-md"
                  disabled={isOutOfStock}
                  onClick={() => setShowBookingDialog(true)}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />{" "}
                  {isOutOfStock ? "Out of Stock" : "Place Order Now"}
                </Button>
              )}
              <div className="text-muted-foreground mt-2 flex w-full items-center justify-center gap-4 text-[10px] font-bold tracking-widest uppercase">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Secure Checkout
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Verified Seller
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

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
