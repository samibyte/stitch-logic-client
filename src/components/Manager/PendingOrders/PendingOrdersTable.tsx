import { useState, useEffect } from "react";
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  User,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

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

const PendingOrdersTable = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch pending orders with server-side filtering
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
      "pending-orders",
      {
        search: debouncedSearchTerm,
        page,
        limit,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (debouncedSearchTerm) params.append("searchText", debouncedSearchTerm);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await axiosSecure.get(
        `/orders/status/pending?${params.toString()}`,
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const { orders, pagination } = ordersData;

  // Approve order mutation
  const approveOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await axiosSecure.patch(`/orders/${orderId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
      toast.success("Order approved successfully");
    },
    onError: () => {
      toast.error("Failed to approve order");
    },
  });

  // Reject order mutation
  const rejectOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await axiosSecure.patch(`/orders/${orderId}/reject`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
      toast.success("Order rejected successfully");
    },
    onError: () => {
      toast.error("Failed to reject order");
    },
  });

  // Table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "trackingId",
      header: "Order ID",
      cell: (row) => (
        <div>
          <p className="font-mono font-medium text-gray-900">
            {row.trackingId}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(row.createdAt).toLocaleDateString()}
          </p>
        </div>
      ),
      width: "150px",
    },
    {
      accessorKey: "buyer",
      header: "Buyer",
      cell: (row) => (
        <div>
          <p className="font-medium">
            {row.buyer?.firstName || ""} {row.buyer?.lastName || ""}
          </p>
          <p className="text-xs text-gray-500">{row.buyer?.email || ""}</p>
          <p className="text-xs text-gray-500">
            {row.buyer?.contactNumber || ""}
          </p>
        </div>
      ),
      width: "200px",
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border">
            {row.product?.images?.[0] ? (
              <img
                src={row.product.images[0]}
                alt={row.product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/avatar-01.png";
                }}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{row.product?.name || "Product"}</p>
            <p className="text-xs text-gray-500 capitalize">
              {row.product?.category || "Category"}
            </p>
            <p className="text-xs text-gray-500">
              ${row.product?.price?.toFixed(2) || "0.00"} each
            </p>
          </div>
        </div>
      ),
      width: "250px",
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: (row) => (
        <div className="text-center">
          <p className="font-medium">{row.quantity}</p>
          <p className="text-xs text-gray-500">
            ${row.orderPrice?.toFixed(2) || "0.00"} total
          </p>
        </div>
      ),
    },
    {
      accessorKey: "paymentOption",
      header: "Payment",
      cell: (row) => (
        <Badge
          variant={row.paymentOption === "PayFirst" ? "secondary" : "outline"}
        >
          {row.paymentOption === "PayFirst" ? "Pay First" : "COD"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <Badge
          variant="outline"
          className="border-0 bg-yellow-100 text-yellow-800"
        >
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Pending
          </div>
        </Badge>
      ),
    },
  ];

  // Summary stats
  const summaryStats = [
    {
      label: "Total Pending",
      value: pagination.totalItems,
      color: "text-yellow-600",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: "Revenue",
      value: `$${orders
        .reduce((sum: number, order: Order) => sum + (order.orderPrice || 0), 0)
        .toLocaleString()}`,
      color: "text-blue-600",
      icon: <DollarSign className="h-4 w-4" />,
      tooltip: "Total pending order value",
    },
    {
      label: "Buyers",
      value: new Set(orders.map((o: Order) => o.buyer?.email)).size,
      color: "text-green-600",
      icon: <User className="h-4 w-4" />,
      tooltip: "Unique buyers with pending orders",
    },
    {
      label: "Products",
      value: orders.length,
      color: "text-purple-600",
      icon: <Package className="h-4 w-4" />,
      tooltip: "Total pending orders",
    },
    {
      label: "Page Info",
      value: `${page} / ${pagination.totalPages}`,
      color: "text-gray-600",
      icon: <Search className="h-4 w-4" />,
      tooltip: `Showing ${(page - 1) * limit + 1}-${Math.min(
        page * limit,
        pagination.totalItems,
      )} of ${pagination.totalItems} orders`,
    },
  ];

  // Row actions for pending orders
  const getRowActions = (order: Order) => {
    return [
      {
        label: "View Details",
        icon: <Eye className="mr-2 h-4 w-4" />,
        onClick: () => navigate(`/dashboard/orders/${order._id}`),
      },
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
  };

  // Handlers
  const handleApproveOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Approve Order?",
      text: "This will approve the order and notify the buyer.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, approve",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    approveOrderMutation.mutate(orderId);
  };

  const handleRejectOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Reject Order?",
      text: "This will reject the order and notify the buyer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, reject",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    rejectOrderMutation.mutate(orderId);
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

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setPage(1);
  };

  return (
    <div>
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isOrdersLoading || isFetching}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search orders by tracking ID, buyer name, or email..."
        filters={[]}
        summaryStats={summaryStats}
        emptyMessage="No pending orders found"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onNextPage: handleNextPage,
          onPrevPage: handlePrevPage,
          onPageChange: handlePageChange,
        }}
        showClearFilters={searchTerm !== ""}
        onClearFilters={handleClearFilters}
        skeletonCount={limit}
        getRowActions={getRowActions}
      />
    </div>
  );
};

export default PendingOrdersTable;
