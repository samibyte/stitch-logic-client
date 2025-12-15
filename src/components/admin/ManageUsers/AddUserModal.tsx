import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type React from "react";

interface AddUserModalProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddUserModal = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
}: AddUserModalProps) => {
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with specific role and permissions.
          </DialogDescription>
          <DialogTitle className="text-primary text-md">
            Feature yet to be released!
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
