import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, Loader2 } from "lucide-react";
import type { User } from "./ManageUsersTable";

interface SuspendUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  // Updated onConfirm to pass the form data
  onConfirm: (data: { reason: string; feedback: string }) => void;
  isLoading: boolean;
}

const SuspendUserModal = ({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: SuspendUserModalProps) => {
  const [reason, setReason] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  if (!user) return null;

  const handleSubmit = () => {
    if (!reason) return;
    onConfirm({ reason, feedback });
    // Reset form after submission logic
    setReason("");
    setFeedback("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="h-5 w-5" />
            Suspend User: {user.displayName}
          </DialogTitle>
          <DialogDescription>
            Please provide a reason and feedback for this suspension. This
            information may be shared with the user.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Suspend Reason Category */}
          <div className="grid gap-2">
            <Label htmlFor="reason">Suspension Reason</Label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terms_violation">
                  Violation of Terms
                </SelectItem>
                <SelectItem value="suspicious_activity">
                  Suspicious Activity
                </SelectItem>
                <SelectItem value="spam">Spamming/Harassment</SelectItem>
                <SelectItem value="payment_fraud">Payment Fraud</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Detailed Feedback */}
          <div className="grid gap-2">
            <Label htmlFor="feedback">Why are you suspending? (Feedback)</Label>
            <Textarea
              id="feedback"
              placeholder="Provide specific details about the suspension..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading || !reason}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
              </>
            ) : (
              "Confirm Suspension"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuspendUserModal;
