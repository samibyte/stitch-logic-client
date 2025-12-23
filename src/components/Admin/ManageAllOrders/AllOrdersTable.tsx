import { useState, useEffect } from "react";
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Package,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

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
  product: OrderProduct;
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

const AllOrdersTable = () => {
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
      "orders",
      {
        search: debouncedSearchTerm,
        status: statusFilter,
        page,
        limit,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("searchText", debouncedSearchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await axiosSecure.get(`/orders?${params.toString()}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const { orders, pagination } = ordersData;

  const approveOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await axiosSecure.patch(`/orders/${orderId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order approved successfully");
    },
    onError: () => {
      toast.error("Failed to approve order");
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await axiosSecure.patch(`/orders/${orderId}/reject`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order rejected successfully");
    },
    onError: () => {
      toast.error("Failed to reject order");
    },
  });

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
      accessorKey: "buyer",
      header: "User",
      cell: (row) => {
        return (
          <div>
            <p className="text-foreground font-medium">
              {row?.buyer?.firstName} {row?.buyer?.lastName}
            </p>
            <p className="text-muted-foreground text-xs">{row?.buyer?.email}</p>
            <p className="text-muted-foreground text-xs">
              {row?.buyer?.contactNumber}
            </p>
          </div>
        );
      },
      width: "200px",
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="border-border h-10 w-10 shrink-0 overflow-hidden rounded-md border">
            {row?.product?.images && row?.product?.images.length > 0 ? (
              <img
                src={row?.product?.images[0]}
                alt={row?.product?.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/avatar-01.png";
                }}
                loading="lazy"
              />
            ) : (
              <div className="bg-muted flex h-full w-full items-center justify-center">
                <Package className="text-muted-foreground h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <p className="text-foreground font-medium">{row?.product?.name}</p>
            <p className="text-muted-foreground text-xs capitalize">
              {row?.product?.category}
            </p>
            <p className="text-muted-foreground text-xs">
              ${row?.product?.price.toFixed(2)} each
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
        <div className="text-center">
          <p className="text-foreground font-medium">{row?.quantity}</p>
          <p className="text-muted-foreground text-xs">
            ${row?.orderPrice.toFixed(2)} total
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const getStatusConfig = (status: OrderStatus) => {
          switch (status) {
            case "pending":
              return {
                bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
                text: "text-yellow-700 dark:text-yellow-400",
                icon: <Clock className="h-4 w-4" />,
                label: "Pending",
              };
            case "approved":
              return {
                bg: "bg-green-500/10 dark:bg-green-500/20",
                text: "text-green-700 dark:text-green-400",
                icon: <CheckCircle className="h-4 w-4" />,
                label: "Approved",
              };
            case "rejected":
              return {
                bg: "bg-red-500/10 dark:bg-red-500/20",
                text: "text-red-700 dark:text-red-400",
                icon: <XCircle className="h-4 w-4" />,
                label: "Rejected",
              };
            case "cancelled":
              return {
                bg: "bg-muted",
                text: "text-muted-foreground",
                icon: <XCircle className="h-4 w-4" />,
                label: "Cancelled",
              };
            default:
              return {
                bg: "bg-muted",
                text: "text-muted-foreground",
                icon: <AlertCircle className="h-4 w-4" />,
                label: "Unknown",
              };
          }
        };

        const config = getStatusConfig(row?.status);

        return (
          <Badge
            variant="outline"
            className={`${config.bg} ${config.text} border-0`}
          >
            <div className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: (row) => (
        <Badge
          variant={row?.paymentStatus === "paid" ? "default" : "outline"}
          className={
            row?.paymentStatus === "pending"
              ? "border-orange-600/50 text-orange-600 dark:text-orange-400"
              : ""
          }
        >
          {row?.paymentStatus === "paid" ? "Paid" : "Pending"}
        </Badge>
      ),
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
      color: "text-yellow-600 dark:text-yellow-400",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: "Approved",
      value: orders.filter((o: Order) => o.status === "approved").length,
      color: "text-green-600 dark:text-green-400",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      label: "Revenue",
      value: `$${orders
        .filter((o: Order) => o.status === "approved" || o.status === "pending")
        .reduce((sum: number, order: Order) => sum + order.orderPrice, 0)
        .toLocaleString()}`,
      color: "text-blue-600 dark:text-blue-400",
      icon: <DollarSign className="h-4 w-4" />,
      tooltip: "Total revenue from approved and pending orders",
    },
    {
      label: "Page Info",
      value: `${page} / ${pagination.totalPages}`,
      color: "text-muted-foreground",
      icon: <Search className="h-4 w-4" />,
      tooltip: `Showing ${(page - 1) * limit + 1}-${Math.min(
        page * limit,
        pagination.totalItems,
      )} of ${pagination.totalItems} orders`,
    },
  ];

  const getRowActions = (order: Order) => {
    const baseActions = [
      {
        label: "View Details",
        icon: <Eye className="mr-2 h-4 w-4" />,
        onClick: () => navigate(`/dashboard/track-order/${order._id}`),
      },
    ];

    if (order.status === "pending") {
      return [
        ...baseActions,
        {
          label: "Approve Order",
          icon: <CheckCircle className="mr-2 h-4 w-4" />,
          onClick: () => handleApproveOrder(order._id),
          variant: "default" as const,
        },
        {
          label: "Reject Order",
          icon: <XCircle className="mr-2 h-4 w-4" />,
          onClick: () => handleRejectOrder(order._id),
          variant: "destructive" as const,
        },
      ];
    }

    return baseActions;
  };

  const handleApproveOrder = async (orderId: string) => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Approve Order?",
      text: "This will approve the order and notify the buyer.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, approve",
      cancelButtonText: "Cancel",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#f3f4f6" : "#374151",
    });

    if (!result.isConfirmed) return;
    approveOrderMutation.mutate(orderId);
  };

  const handleRejectOrder = async (orderId: string) => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Reject Order?",
      text: "This will reject the order and notify the buyer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, reject",
      cancelButtonText: "Cancel",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#f3f4f6" : "#374151",
    });

    if (!result.isConfirmed) return;
    rejectOrderMutation.mutate(orderId);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) setPage((prev) => prev - 1);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <div className="bg-background text-foreground">
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isOrdersLoading || isFetching}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search orders..."
        filters={filters}
        summaryStats={summaryStats}
        emptyMessage="No orders found matching your criteria"
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

export default AllOrdersTable;
