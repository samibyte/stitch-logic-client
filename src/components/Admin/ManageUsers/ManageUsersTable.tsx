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
import SuspendUserModal from "./SuspendUserModal";

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
  const [limit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (searchTimeout) clearTimeout(searchTimeout);

      const timeout = setTimeout(() => {
        setDebouncedSearchTerm(value);
        setPage(1);
      }, 500);

      setSearchTimeout(timeout);
    },
    [searchTimeout],
  );

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

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
      reason,
      feedback,
    }: {
      userId: string;
      status: UserStatus;
      reason?: string;
      feedback?: string;
    }) => {
      const res = await axiosSecure.patch(`/users/${userId}`, {
        status: status,
        suspendReason: reason,
        suspendFeedback: feedback,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated successfully");
      setIsSuspendDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update user status",
      );
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
    onError: () => toast.error("Failed to update role"),
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
    onError: () => toast.error("Failed to delete user"),
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "displayName",
      header: "User",
      cell: (row) => (
        <AvatarCell
          image={row.photoURL}
          name={row.displayName}
          subtitle={`ID: ${row._id.slice(-6)}`}
          className="text-foreground"
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
            <SelectTrigger className="bg-background border-border hover:bg-muted/50 capitalize transition-colors">
              <SelectValue>
                <StatusBadge status={row.role} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem
                value="admin"
                className="focus:bg-muted focus:text-foreground"
              >
                Admin
              </SelectItem>
              <SelectItem
                value="manager"
                className="focus:bg-muted focus:text-foreground"
              >
                Manager
              </SelectItem>
              <SelectItem
                value="buyer"
                className="focus:bg-muted focus:text-foreground"
              >
                Buyer
              </SelectItem>
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
      cell: (row) => (
        <span className="text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
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
        setPage(1);
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

  const summaryStats = [
    {
      label: "Total Users",
      value: pagination.totalItems,
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Admins",
      value: users.filter((u: User) => u.role === "admin").length,
      color: "text-chart-1", // Changed from red-600 to theme chart color
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: "Managers",
      value: users.filter((u: User) => u.role === "manager").length,
      color: "text-chart-2", // Changed from blue-600
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Buyers",
      value: users.filter((u: User) => u.role === "buyer").length,
      color: "text-chart-3", // Changed from green-600
      icon: <User className="h-4 w-4" />,
    },
    {
      label: "Page Info",
      value: `${page} / ${pagination.totalPages}`,
      color: "text-muted-foreground",
      icon: <Search className="h-4 w-4" />,
      tooltip: `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, pagination.totalItems)} of ${pagination.totalItems} users`,
    },
  ];

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

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const isDark = document.documentElement.classList.contains("dark");

    if (newRole === "admin" || newRole === "manager") {
      const result = await Swal.fire({
        title: `Make User a ${newRole === "admin" ? "Admin" : "Manager"}?`,
        text: `This user will gain ${newRole} privileges. Are you sure?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "hsl(var(--primary))",
        cancelButtonColor: "hsl(var(--destructive))",
        background: isDark ? "hsl(var(--card))" : "#fff",
        color: isDark ? "hsl(var(--foreground))" : "#000",
        confirmButtonText: `Yes, make ${newRole}`,
      });

      if (!result.isConfirmed) return;
    }
    updateUserRoleMutation.mutate({ userId, newRole });
  };

  const handleDeleteUser = async (userId: string) => {
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone!",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "hsl(var(--destructive))",
      cancelButtonColor: "hsl(var(--secondary))",
      background: isDark ? "hsl(var(--card))" : "#fff",
      color: isDark ? "hsl(var(--foreground))" : "#000",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;
    deleteUserMutation.mutate(userId);
  };

  const handleUpdateUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleOpenSuspendFromEdit = () => {
    setIsEditDialogOpen(false);
    setIsSuspendDialogOpen(true);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
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
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onNextPage: () =>
            pagination.hasNextPage && setPage((prev) => prev + 1),
          onPrevPage: () =>
            pagination.hasPrevPage && setPage((prev) => prev - 1),
          onPageChange: (newPage) => setPage(newPage),
        }}
        showClearFilters={
          roleFilter !== "all" || statusFilter !== "all" || searchTerm !== ""
        }
        onClearFilters={() => {
          setSearchTerm("");
          setDebouncedSearchTerm("");
          setRoleFilter("all");
          setStatusFilter("all");
          setPage(1);
        }}
        skeletonCount={limit}
      />

      <AddUserModal
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />
      <EditUserModal
        user={selectedUser}
        onUpdateStatus={(status) => {
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
        }}
        onSuspendClick={handleOpenSuspendFromEdit}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
      />
      <SuspendUserModal
        user={selectedUser}
        isOpen={isSuspendDialogOpen}
        onClose={() => {
          setIsSuspendDialogOpen(false);
          setSelectedUser(null);
        }}
        isLoading={updateUserMutation.isPending}
        onConfirm={(data) => {
          if (selectedUser) {
            updateUserMutation.mutate({
              userId: selectedUser._id,
              status: "suspended",
              reason: data.reason,
              feedback: data.feedback,
            });
          }
        }}
      />
    </div>
  );
};

export default ManageUsersTable;
