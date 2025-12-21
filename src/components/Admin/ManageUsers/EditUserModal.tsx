import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User, UserStatus } from "./ManageUsersTable";

interface EditUserModalProps {
  user: User | null;
  onUpdateStatus: (status: UserStatus) => void;
  onSuspendClick: () => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type StatusAction = {
  label: string;
  next: UserStatus;
};

const EditUserModal = ({
  user,
  onUpdateStatus,
  onSuspendClick,
  isEditDialogOpen,
  setIsEditDialogOpen,
}: EditUserModalProps) => {
  if (!user) return null;

  const handleAction = (nextStatus: UserStatus) => {
    if (nextStatus === "suspended") {
      onSuspendClick();
    } else {
      onUpdateStatus(nextStatus);
    }
  };

  const statusActions: Record<UserStatus, StatusAction[]> = {
    pending: [
      { label: "Approve", next: "active" },
      { label: "Suspend", next: "suspended" },
    ],
    suspended: [{ label: "Approve", next: "active" }],
    active: [{ label: "Suspend", next: "suspended" }],
  };

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 rounded-md border p-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex flex-col">
            <span className="font-medium">{user.displayName}</span>
            <span className="text-muted-foreground text-sm">{user.email}</span>

            <div className="text-muted-foreground mt-1 flex gap-2 text-xs">
              <span className="capitalize">Role: {user.role}</span>
              <span className="capitalize">Status: {user.status}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          {statusActions[user.status].map(({ label, next }) => (
            <Button
              key={next}
              variant={next === "suspended" ? "destructive" : "default"}
              onClick={() => handleAction(next)}
            >
              {label}
            </Button>
          ))}
        </div>  
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
