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
  Ban,
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
  suspendReason?: string;
  suspendFeedback?: string;
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: "", email: "", photoURL: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL || "",
      });
    }
  }, [user, reset]);

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
      toast.error(
        axiosError.response?.data?.message || "Failed to update profile",
      );
    },
  });

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      if (error) {
        toast.error("Failed to logout");
      }
    }
  };

  const onSubmit = (data: ProfileFormData) =>
    updateProfileMutation.mutate(data);

  const handleCancelEdit = () => {
    reset({
      displayName: user?.displayName || "",
      email: user?.email || "",
      photoURL: user?.photoURL || "",
    });
    setIsEditing(false);
  };

  // Dark-mode optimized Badge Colors
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "manager":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "buyer":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "suspended":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl py-20 text-center">
          <AlertCircle className="text-destructive mx-auto mb-4 h-16 w-16" />
          <h2 className="text-2xl font-bold">Unable to load profile</h2>
          <p className="text-muted-foreground mt-2">
            There was an error loading your profile information.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const formatSuspensionReason = (reason: string) => {
    if (!reason) return "Reason not specified";
    return reason
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-background text-foreground container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            {/* Personal Information Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="text-primary h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      isEditing ? handleCancelEdit() : setIsEditing(true)
                    }
                  >
                    {isEditing ? (
                      <>
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                    <div className="flex flex-col items-center">
                      <Avatar className="border-background h-24 w-24 border-4 shadow-xl">
                        <AvatarImage
                          src={user.photoURL || "/default-avatar.png"}
                          alt={user.displayName}
                        />
                        <AvatarFallback className="bg-muted text-lg">
                          {user.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="mt-4 w-full">
                          <Label
                            htmlFor="photoURL"
                            className="text-muted-foreground text-xs tracking-wider uppercase"
                          >
                            Profile Picture URL
                          </Label>
                          <Input
                            id="photoURL"
                            {...register("photoURL")}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>

                    <div className="w-full flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="displayName"
                            {...register("displayName")}
                            className={
                              errors.displayName ? "border-destructive" : ""
                            }
                          />
                        ) : (
                          <div className="bg-muted/50 border-border text-foreground rounded-md border px-3 py-2">
                            {user.displayName}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            readOnly
                            {...register("email")}
                            className="bg-muted cursor-not-allowed"
                          />
                        ) : (
                          <div className="bg-muted/50 border-border flex items-center gap-2 rounded-md border px-3 py-2">
                            <Mail className="text-muted-foreground h-4 w-4" />
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Account Role</Label>
                      <Badge
                        variant="outline"
                        className={`${getRoleColor(user.role)} border px-2 py-1`}
                      >
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role.toUpperCase()}
                        </div>
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Status</Label>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(user.status)} border px-2 py-1`}
                      >
                        {user.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending || !isDirty}
                      >
                        {updateProfileMutation.isPending && (
                          <div className="border-primary-foreground mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        )}
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Role Specific Cards - Example: Buyer */}
            {user.role === "buyer" && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingBag className="text-primary h-5 w-5" /> Buyer
                    Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-primary/5 border-primary/10 rounded-lg border p-4">
                    <h4 className="text-primary font-medium">
                      Order Statistics
                    </h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Track shipments and manage returns
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate("/dashboard/my-orders")}
                    >
                      View My Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add similar logic for Manager/Admin cards using border-border and bg-muted/50 */}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" /> Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-semibold uppercase">
                    User ID
                  </span>
                  <div className="bg-muted border-border rounded border p-2 font-mono text-[10px] break-all">
                    {user._id}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-semibold uppercase">
                    Joined On
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="text-muted-foreground h-4 w-4" />{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {}}
                >
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </CardContent>
            </Card>

            {/* Status Alert for Suspended/Pending */}
            {user.status !== "active" && (
              <div
                className={`rounded-xl border-l-4 p-4 shadow-sm ${user.status === "suspended" ? "border-destructive bg-destructive/10" : "border-yellow-500 bg-yellow-500/10"}`}
              >
                <div className="mb-2 flex items-center gap-2 font-bold">
                  {user.status === "suspended" ? (
                    <>
                      <Ban className="text-destructive h-5 w-5" /> Suspended
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-yellow-600" />{" "}
                      Pending
                    </>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  <p
                    className={
                      user.status === "suspended"
                        ? "text-destructive"
                        : "text-yellow-700 dark:text-yellow-500"
                    }
                  >
                    {user.status === "pending"
                      ? "Your account is under review."
                      : `Reason: ${formatSuspensionReason(user.suspendReason || "")}`}
                  </p>
                  {user.suspendFeedback && (
                    <div className="bg-background/50 border-border rounded border p-2 text-xs">
                      "{user.suspendFeedback}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
