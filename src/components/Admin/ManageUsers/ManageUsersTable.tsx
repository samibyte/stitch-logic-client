import { useState, useCallback } from "react";
import { DataTable, type ColumnDef } from "@/components/DataTable/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, User, Shield, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AvatarCell } from "../../DataTable/AvatarCell";
import { StatusBadge } from "../../DataTable/StatusBadge";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";

export type UserRole = "admin" | "manager" | "buyer";
export type UserStatus = "suspended" | "active" | "pending";

export interface User {
  _id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
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

interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

const ManageUsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Items per page
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  // Debounce search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for debouncing
      const timeout = setTimeout(() => {
        setDebouncedSearchTerm(value);
        setPage(1); // Reset to first page on new search
      }, 500); // 500ms debounce delay

      setSearchTimeout(timeout);
    },
    [searchTimeout],
  );

  // Fetch users with server-side filtering
  const {
    data: usersData = {
      users: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
        itemsPerPage: limit,
      },
    },
    isLoading: isUsersLoading,
    isFetching,
  } = useQuery<UsersResponse>({
    queryKey: [
      "users",
      {
        search: debouncedSearchTerm,
        role: roleFilter,
        status: statusFilter,
        page,
        limit,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (debouncedSearchTerm) params.append("searchText", debouncedSearchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await axiosSecure.get(`/users?${params.toString()}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const { users, pagination } = usersData;

  // Update mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: UserStatus;
    }) => {
      const res = await axiosSecure.patch(`/users/${userId}`, {
        status: status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update user status");
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: UserRole;
    }) => {
      const res = await axiosSecure.patch(`/users/${userId}/role`, {
        role: newRole,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated successfully");
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await axiosSecure.delete(`/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "displayName",
      header: "User",
      cell: (row) => (
        <AvatarCell
          image={row.photoURL}
          name={row.displayName}
          subtitle={`ID: ${row._id.slice(-6)}`}
        />
      ),
      width: "250px",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (row) => (
        <div className="w-[120px]">
          <Select
            value={row.role}
            onValueChange={(value: UserRole) =>
              handleRoleChange(row._id, value)
            }
            disabled={updateUserRoleMutation.isPending}
          >
            <SelectTrigger className="capitalize">
              <SelectValue>
                <StatusBadge status={row.role} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="buyer">Buyer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (row) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
  ];

  const filters = [
    {
      label: "Role",
      value: roleFilter,
      options: [
        { value: "all", label: "All Roles" },
        { value: "admin", label: "Admin" },
        { value: "manager", label: "Manager" },
        { value: "buyer", label: "Buyer" },
      ],
      onValueChange: (value: string) => {
        setRoleFilter(value);
        setPage(1); // Reset to first page
      },
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "suspended", label: "Suspended" },
      ],
      onValueChange: (value: string) => {
        setStatusFilter(value);
        setPage(1);
      },
      icon: <Filter className="h-4 w-4" />,
    },
  ];

  // Summary stats
  const summaryStats = [
    {
      label: "Total Users",
      value: pagination.totalItems,
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Admins",
      value: users.filter((u: User) => u.role === "admin").length,
      color: "text-red-600",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: "Managers",
      value: users.filter((u: User) => u.role === "manager").length,
      color: "text-blue-600",
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Buyers",
      value: users.filter((u: User) => u.role === "buyer").length,
      color: "text-green-600",
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Page Info",
      value: `${page} / ${pagination.totalPages}`,
      color: "text-gray-600",
      icon: <Search className="h-4 w-4" />,
      tooltip: `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.totalItems)} of ${pagination.totalItems} users`,
    },
  ];

  // Table actions
  const actions = [
    {
      label: "Update User",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: (user: User) => handleUpdateUser(user),
    },
    {
      label: "Delete User",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: (user: User) => handleDeleteUser(user._id),
      variant: "destructive" as const,
      disabled: () => deleteUserMutation.isPending,
    },
  ];

  // Handlers
  const handleStatusUpdate = async (status: UserStatus) => {
    if (!selectedUser) return;

    updateUserMutation.mutate(
      { userId: selectedUser._id, status },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedUser(null);
        },
      },
    );
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (newRole === "admin") {
      const result = await Swal.fire({
        title: "Make User an Admin?",
        text: "This user will gain admin privileges. Are you sure?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, make admin",
      });

      if (!result.isConfirmed) return;
    } else if (newRole === "manager") {
      const result = await Swal.fire({
        title: "Make User a Manager?",
        text: "This user will gain manager privileges. Are you sure?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, make manager",
      });

      if (!result.isConfirmed) return;
    }

    updateUserRoleMutation.mutate({ userId, newRole });
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone!",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    deleteUserMutation.mutate(userId);
  };

  const handleUpdateUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
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

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <div>
      <DataTable
        data={users}
        columns={columns}
        isLoading={isUsersLoading || isFetching}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search users by name or email..."
        filters={filters}
        actions={actions}
        onAdd={() => setIsAddDialogOpen(true)}
        addButtonLabel="Add User"
        summaryStats={summaryStats}
        emptyMessage="No users found matching your criteria"
        // Pagination props
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onNextPage: handleNextPage,
          onPrevPage: handlePrevPage,
          onPageChange: handlePageChange,
        }}
        // Clear filters button
        showClearFilters={
          roleFilter !== "all" || statusFilter !== "all" || searchTerm !== ""
        }
        onClearFilters={handleClearFilters}
        // Loading state
        skeletonCount={limit}
      />

      {/* Additional Dialogs */}
      <AddUserModal
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />
      <EditUserModal
        user={selectedUser}
        onUpdateStatus={handleStatusUpdate}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
      />
    </div>
  );
};

export default ManageUsersTable;
