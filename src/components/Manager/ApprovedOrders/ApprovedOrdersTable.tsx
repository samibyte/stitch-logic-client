import { useState, useEffect } from "react";
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";

import {
  Package,
  DollarSign,
  CheckCircle,
  Truck,
  Search,
  MapPin,
  Clock,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import AddTrackingModal from "./AddTrackingModal";

export type OrderStatus = "pending" | "approved" | "rejected" | "cancelled";
export type TrackingStatus =
  | "Cutting Completed"
  | "Sewing Started"
  | "Finishing"
  | "QC Checked"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered";

export interface TrackingUpdate {
  _id: string;
  location: string;
  note: string;
  status: TrackingStatus;
  updatedAt: string;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

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
  paymentStatus: "pending" | "paid";
  status: OrderStatus;
  createdAt: string;
  approvedAt: string;
  trackingUpdates?: TrackingUpdate[];
  lastTrackingUpdate?: TrackingUpdate;
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

const ApprovedOrdersTable = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddTrackingOpen, setIsAddTrackingOpen] = useState(false);

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch approved orders with server-side filtering
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
      "approved-orders",
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
        `/orders/status/approved?${params.toString()}`,
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const { orders, pagination } = ordersData;

  // Add tracking mutation
  const addTrackingMutation = useMutation({
    mutationFn: async ({
      orderId,
      trackingData,
    }: {
      orderId: string;
      trackingData: {
        location: string;
        note: string;
        status: TrackingStatus;
      };
    }) => {
      const res = await axiosSecure.post(
        `/orders/${orderId}/tracking`,
        trackingData,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approved-orders"] });
      toast.success("Tracking update added successfully");
      setIsAddTrackingOpen(false);
      setSelectedOrder(null);
    },
    onError: () => {
      toast.error("Failed to add tracking update");
    },
  });

  // Table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "trackingId",
      header: "Order ID",
      cell: (row) => (
        <div>
          <p className="text-foreground-900 font-mono font-medium">
            {row.trackingId}
          </p>
          <p className="text-xs text-gray-500">
            Approved:{" "}
            {row.approvedAt
              ? new Date(row.approvedAt).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      ),
      width: "150px",
    },
    {
      accessorKey: "buyer",
      header: "User",
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
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border">
            {row.productId?.images?.[0] ? (
              <img
                src={row.productId.images[0]}
                alt={row.productId.name}
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
            <p className="font-medium">{row.productId?.name || "Product"}</p>
            <p className="text-xs text-gray-500 capitalize">
              {row.productId?.category || "Category"}
            </p>
            <p className="text-xs text-gray-500">
              ${row.productId?.price?.toFixed(2) || "0.00"} each
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
          <p className="font-medium">{row.quantity}</p>
          <p className="text-xs text-gray-500">
            ${row.orderPrice?.toFixed(2) || "0.00"} total
          </p>
        </div>
      ),
    },
    {
      accessorKey: "approvedAt",
      header: "Approved Date",
      cell: (row) => (
        <div>
          <p className="font-medium">
            {row.approvedAt
              ? new Date(row.approvedAt).toLocaleDateString()
              : "N/A"}
          </p>
          <p className="text-xs text-gray-500">
            {row.approvedAt
              ? new Date(row.approvedAt).toLocaleTimeString()
              : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "lastTrackingUpdate",
      header: "Status",
      cell: (row) => {
        const lastUpdate =
          row.lastTrackingUpdate ||
          row.trackingUpdates?.[row.trackingUpdates.length - 1];

        const getStatusColor = (status?: TrackingStatus) => {
          switch (status) {
            case "Delivered":
              return "bg-green-100 text-green-800";
            case "Out for Delivery":
              return "bg-blue-100 text-blue-800";
            case "Shipped":
              return "bg-indigo-100 text-indigo-800";
            case "Packed":
              return "bg-purple-100 text-purple-800";
            case "QC Checked":
              return "bg-amber-100 text-amber-800";
            case "Finishing":
              return "bg-orange-100 text-orange-800";
            case "Sewing Started":
              return "bg-red-100 text-red-800";
            case "Cutting Completed":
              return "bg-pink-100 text-pink-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };

        return (
          <div>
            {lastUpdate ? (
              <Badge
                variant="outline"
                className={`${getStatusColor(lastUpdate.status)} border-0`}
              >
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {lastUpdate.status}
                </div>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-0 bg-yellow-100 text-yellow-800"
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Processing Started
                </div>
              </Badge>
            )}
            {lastUpdate && (
              <p className="mt-1 text-xs text-gray-500">
                {new Date(lastUpdate.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      },
    },
  ];

  // Summary stats
  const summaryStats = [
    {
      label: "Total Approved",
      value: pagination.totalItems,
      color: "text-green-600",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      label: "Total Revenue",
      value: `$${orders
        .reduce((sum: number, order: Order) => sum + (order.orderPrice || 0), 0)
        .toLocaleString()}`,
      color: "text-blue-600",
      icon: <DollarSign className="h-4 w-4" />,
      tooltip: "Total approved order value",
    },
    {
      label: "Avg Order Value",
      value: `$${
        orders.length > 0
          ? (
              orders.reduce((sum, order) => sum + (order.orderPrice || 0), 0) /
              orders.length
            ).toFixed(2)
          : "0.00"
      }`,
      color: "text-purple-600",
      icon: <DollarSign className="h-4 w-4" />,
      tooltip: "Average value per order",
    },
    {
      label: "Tracked Orders",
      value: orders.filter(
        (o) => o.trackingUpdates && o.trackingUpdates.length > 0,
      ).length,
      color: "text-indigo-600",
      icon: <Truck className="h-4 w-4" />,
      tooltip: "Orders with tracking updates",
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

  // Row actions for approved orders
  const getRowActions = (order: Order) => {
    const actions = [
      {
        label: "Track Order",
        icon: <MapPin className="mr-2 h-4 w-4" />,
        onClick: (order: Order) =>
          navigate(`/dashboard/track-order/${order._id}`),
      },
    ];

    actions.push({
      label: "Add Tracking",
      icon: <Truck className="mr-2 h-4 w-4" />,
      onClick: () => {
        setSelectedOrder(order);
        setIsAddTrackingOpen(true);
      },
    });

    return actions;
  };

  // Handlers
  const handleAddTracking = (trackingData: {
    location: string;
    note: string;
    status: TrackingStatus;
  }) => {
    if (!selectedOrder?._id) return;

    addTrackingMutation.mutate({
      orderId: selectedOrder._id,
      trackingData,
    });
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
        searchPlaceholder="Search approved orders by tracking ID, buyer name, or email..."
        filters={[]}
        summaryStats={summaryStats}
        emptyMessage="No approved orders found"
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

      {/* Add Tracking Modal */}
      <AddTrackingModal
        key={selectedOrder?._id}
        order={selectedOrder}
        isOpen={isAddTrackingOpen}
        onClose={() => {
          setIsAddTrackingOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleAddTracking}
        isLoading={addTrackingMutation.isPending}
      />
    </div>
  );
};

export default ApprovedOrdersTable;
