import { useState, useEffect } from "react";
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ShoppingCart,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import type { AxiosError } from "axios";

export type OrderStatus = "pending" | "approved" | "rejected" | "cancelled";
export type PaymentStatus = "pending" | "paid";

export interface OrderProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

export interface Order {
  _id: string;
  trackingId: string;
  buyer: {
    firebaseUid: string;
    email: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    deliveryAddress: string;
    notes?: string;
  };
  productId: OrderProduct;
  paymentOption: string;
  quantity: number;
  orderPrice: number;
  requiresOnlinePayment: boolean;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  approvedAt?: string;
  cancelledAt?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemsPerPage: number;
}

interface OrdersResponse {
  orders: Order[];
  pagination: PaginationInfo;
}

const MyOrdersTable = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: ordersData = {
      orders: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
        itemsPerPage: limit,
      },
    },
    isLoading: isOrdersLoading,
    isFetching,
  } = useQuery<OrdersResponse>({
    queryKey: [
      "my-orders",
      { search: debouncedSearchTerm, status: statusFilter, page, limit },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("searchText", debouncedSearchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await axiosSecure.get(
        `/orders/my/orders?${params.toString()}`,
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const { orders, pagination } = ordersData;

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await axiosSecure.patch(`/orders/${orderId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to cancel order";
      toast.error(errorMessage);
    },
  });

  // Updated columns for Dark Mode compatibility
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "trackingId",
      header: "Order ID",
      cell: (row) => (
        <div>
          <p className="text-foreground font-mono font-medium">
            {row?.trackingId}
          </p>
          <p className="text-muted-foreground text-xs">
            {new Date(row?.createdAt).toLocaleDateString()}
          </p>
        </div>
      ),
      width: "150px",
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="border-border bg-muted h-10 w-10 shrink-0 overflow-hidden rounded-md border">
            {row?.productId?.images && row?.productId?.images.length > 0 ? (
              <img
                src={row?.productId?.images[0]}
                alt={row?.productId?.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/avatar-01.png";
                }}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="text-muted-foreground h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <p className="text-foreground font-medium">
              {row?.productId?.name}
            </p>
            <p className="text-muted-foreground text-xs capitalize">
              {row?.productId?.category}
            </p>
            <p className="text-muted-foreground text-xs">
              ${row?.productId?.price.toFixed(2)} each
            </p>
          </div>
        </div>
      ),
      width: "250px",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: (row) => (
        <div>
          <p className="text-foreground font-medium">{row?.quantity}</p>
          <p className="text-muted-foreground text-xs">
            ${row?.orderPrice.toFixed(2)} total
          </p>
        </div>
      ),
      width: "100px",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const getStatusConfig = (status: OrderStatus) => {
          switch (status) {
            case "pending":
              return {
                className:
                  "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
                icon: <Clock className="h-4 w-4" />,
                label: "Pending",
              };
            case "approved":
              return {
                className:
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
                icon: <CheckCircle className="h-4 w-4" />,
                label: "Approved",
              };
            case "rejected":
              return {
                className: "bg-red-500/10 text-red-600 dark:text-red-500",
                icon: <XCircle className="h-4 w-4" />,
                label: "Rejected",
              };
            case "cancelled":
              return {
                className: "bg-muted text-muted-foreground",
                icon: <Ban className="h-4 w-4" />,
                label: "Cancelled",
              };
            default:
              return {
                className: "bg-muted text-muted-foreground",
                icon: <AlertCircle className="h-4 w-4" />,
                label: "Unknown",
              };
          }
        };

        const config = getStatusConfig(row?.status);

        return (
          <Badge
            variant="outline"
            className={`${config.className} flex w-fit items-center gap-1 border-0`}
          >
            {config.icon}
            {config.label}
          </Badge>
        );
      },
      width: "120px",
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: (row) => (
        <Badge
          variant={row?.paymentStatus === "paid" ? "default" : "outline"}
          className={
            row?.paymentStatus === "pending"
              ? "border-orange-500/50 bg-orange-500/5 text-orange-500"
              : ""
          }
        >
          {row?.paymentStatus === "paid" ? "Paid" : "Pending"}
        </Badge>
      ),
      width: "100px",
    },
  ];

  const filters = [
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "cancelled", label: "Cancelled" },
      ],
      onValueChange: (value: string) => {
        setStatusFilter(value);
        setPage(1);
      },
      icon: <Filter className="h-4 w-4" />,
    },
  ];

  const summaryStats = [
    {
      label: "Total Orders",
      value: pagination.totalItems,
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      label: "Pending",
      value: orders.filter((o: Order) => o.status === "pending").length,
      color: "text-yellow-500",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: "Approved",
      value: orders.filter((o: Order) => o.status === "approved").length,
      color: "text-emerald-500",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      label: "Cancelled",
      value: orders.filter((o: Order) => o.status === "cancelled").length,
      color: "text-muted-foreground",
      icon: <Ban className="h-4 w-4" />,
    },
    {
      label: "Page Info",
      value: `${page} / ${pagination.totalPages}`,
      color: "text-muted-foreground",
      icon: <Search className="h-4 w-4" />,
      tooltip: `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.totalItems)} of ${pagination.totalItems} orders`,
    },
  ];

  const getRowActions = (order: Order) => {
    const actions = [
      {
        label: "View Details",
        icon: <Eye className="mr-2 h-4 w-4" />,
        onClick: () => navigate(`/dashboard/track-order/${order._id}`),
        variant: "outline" as const,
      },
    ];

    if (order.status === "pending") {
      actions.push({
        label: "Cancel Order",
        icon: <Ban className="mr-2 h-4 w-4" />,
        onClick: () => handleCancelOrder(order._id, order.trackingId),
        variant: "outline" as const,
      });
    }

    return actions;
  };

  const handleCancelOrder = async (orderId: string, trackingId: string) => {
    const isDark = document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
      title: "Cancel Order?",
      html: `<p class="text-foreground">Are you sure you want to cancel order <strong>${trackingId}</strong>?</p>
             <p class="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: isDark ? "#27272a" : "#6b7280",
      background: isDark ? "#09090b" : "#ffffff",
      color: isDark ? "#fafafa" : "#18181b",
      confirmButtonText: "Yes, cancel order",
      cancelButtonText: "Keep order",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;
    cancelOrderMutation.mutate(orderId);
  };

  const handleNextPage = () =>
    pagination.hasNextPage && setPage((prev) => prev + 1);
  const handlePrevPage = () =>
    pagination.hasPrevPage && setPage((prev) => prev - 1);
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <div className="bg-background">
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isOrdersLoading || isFetching}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search orders by tracking ID or product name..."
        filters={filters}
        summaryStats={summaryStats}
        emptyMessage="You haven't placed any orders yet"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onNextPage: handleNextPage,
          onPrevPage: handlePrevPage,
          onPageChange: handlePageChange,
        }}
        showClearFilters={statusFilter !== "all" || searchTerm !== ""}
        onClearFilters={handleClearFilters}
        skeletonCount={limit}
        getRowActions={getRowActions}
      />
    </div>
  );
};

export default MyOrdersTable;
