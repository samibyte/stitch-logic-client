import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Shield,
  Calendar,
  LogOut,
  Save,
  Edit2,
  X,
  Briefcase,
  ShoppingBag,
  Settings,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import useAuth from "@/hooks/useAuth";
import type { AxiosError } from "axios";

// Define user type based on schema
interface UserProfile {
  _id: string;
  firebaseUid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: "buyer" | "manager" | "admin";
  status: "pending" | "active" | "suspended";
  createdAt: string;
}

// Validation schema for profile update
const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  photoURL: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const MyProfile = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { signOutUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch user profile
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/my/profile");
      return res.data;
    },
  });

  // Initialize form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      email: "",
      photoURL: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL || "",
      });
    }
  }, [user, reset]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await axiosSecure.patch("/users/my/profile", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message: string }>;

      const errorMessage =
        axiosError.response?.data?.message || "Failed to update profile";

      toast.error(errorMessage);
    },
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to logout");
    }
  };

  // Handle profile update
  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    reset({
      displayName: user?.displayName || "",
      email: user?.email || "",
      photoURL: user?.photoURL || "",
    });
    setIsEditing(false);
  };

  // Get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "buyer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "manager":
        return <Briefcase className="h-4 w-4" />;
      case "buyer":
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="mt-2 h-4 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              <Skeleton className="h-[300px] w-full rounded-lg" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            Unable to load profile
          </h2>
          <p className="mt-2 text-gray-600">
            There was an error loading your profile information.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Profile Card */}
          <div className="space-y-6 md:col-span-2">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage
                          src={user.photoURL || "/default-avatar.png"}
                          alt={user.displayName}
                        />
                        <AvatarFallback className="text-lg">
                          {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="mt-4 w-full">
                          <Label htmlFor="photoURL" className="text-sm">
                            Profile Picture URL
                          </Label>
                          <Input
                            id="photoURL"
                            placeholder="https://example.com/avatar.jpg"
                            {...register("photoURL")}
                            className="mt-1"
                          />
                          {errors.photoURL && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.photoURL.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      {/* Display Name */}
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        {isEditing ? (
                          <>
                            <Input
                              id="displayName"
                              placeholder="Enter your full name"
                              {...register("displayName")}
                              className={
                                errors.displayName ? "border-red-500" : ""
                              }
                            />
                            {errors.displayName && (
                              <p className="text-sm text-red-500">
                                {errors.displayName.message}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="rounded-md bg-gray-50 px-3 py-2">
                            {user.displayName}
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        {isEditing ? (
                          <>
                            <Input
                              id="email"
                              type="email"
                              readOnly
                              placeholder="Enter your email"
                              {...register("email")}
                              className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                              <p className="text-sm text-red-500">
                                {errors.email.message}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="rounded-md bg-gray-50 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {user.email}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role-based information */}
                  <Separator />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Account Role</Label>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getRoleColor(user.role)}
                        >
                          <div className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </div>
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Status</Label>
                      <Badge
                        variant="outline"
                        className={getStatusColor(user.status)}
                      >
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Save button for editing mode */}
                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending || !isDirty}
                      >
                        {updateProfileMutation.isPending && (
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        )}
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Role-specific information */}
            {user.role === "buyer" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Buyer Information
                  </CardTitle>
                  <CardDescription>
                    Your shopping preferences and order history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <h4 className="font-medium text-blue-800">
                        Order Statistics
                      </h4>
                      <p className="mt-1 text-sm text-blue-600">
                        View your order history, track shipments, and manage
                        returns
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => navigate("/dashboard/orders")}
                      >
                        View My Orders
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.role === "manager" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Manager Dashboard
                  </CardTitle>
                  <CardDescription>
                    Manage your products and orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">Product Management</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Add, edit, and manage your products
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => navigate("/dashboard/products")}
                      >
                        Manage Products
                      </Button>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">Order Management</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Review and process customer orders
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => navigate("/dashboard/orders")}
                      >
                        Manage Orders
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.role === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Administrator Tools
                  </CardTitle>
                  <CardDescription>
                    System management and user administration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">User Management</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Manage user accounts and permissions
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">System Settings</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Configure system preferences and settings
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Account Info & Actions */}
          <div className="space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">User ID</Label>
                  <div className="rounded bg-gray-50 p-2 font-mono text-sm">
                    {user._id}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Firebase UID</Label>
                  <div className="truncate rounded bg-gray-50 p-2 font-mono text-sm">
                    {user.firebaseUid}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Member Since</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/dashboard/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            {/* Status Alert */}
            {user.status !== "active" && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-800">
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-700">
                    {user.status === "pending"
                      ? "Your account is pending approval. Some features may be limited."
                      : "Your account is suspended. Please contact support."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyProfile;
