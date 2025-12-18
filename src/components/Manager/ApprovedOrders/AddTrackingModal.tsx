import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Order, TrackingStatus } from "./ApprovedOrdersTable";

interface AddTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    location: string;
    note: string;
    status: TrackingStatus;
    timestamp: string;
  }) => void;
  isLoading: boolean;
}

const TRACKING_STATUSES: TrackingStatus[] = [
  "Cutting Completed",
  "Sewing Started",
  "Finishing",
  "QC Checked",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const AddTrackingModal = ({
  order,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: AddTrackingModalProps) => {
  // Function to calculate initial state
  const getInitialState = () => {
    if (!order)
      return {
        location: "",
        note: "",
        status: "Cutting Completed" as TrackingStatus,
        timestamp: "",
      };

    const lastUpdate =
      order.trackingUpdates?.[order.trackingUpdates.length - 1];
    const lastStatusIndex = lastUpdate
      ? TRACKING_STATUSES.indexOf(lastUpdate.status)
      : -1;

    const nextStatus =
      lastStatusIndex !== -1 && lastStatusIndex < TRACKING_STATUSES.length - 1
        ? TRACKING_STATUSES[lastStatusIndex + 1]
        : lastUpdate?.status || "Cutting Completed";

    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    return {
      location: lastUpdate?.location || "",
      note: "",
      status: nextStatus as TrackingStatus,
      timestamp: localISO,
    };
  };

  // Initialize state once when component mounts
  const [formData, setFormData] = useState(getInitialState);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Tracking: {order.trackingId}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Input
                value={order.productId?.name || "Product"}
                disabled
                className="bg-muted text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleChange("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRACKING_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Time Field */}
          <div className="space-y-2">
            <Label htmlFor="timestamp">Update Date & Time</Label>
            <Input
              id="timestamp"
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) => handleChange("timestamp", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="e.g. Dhaka Factory"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="Optional details..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.location}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Save Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackingModal;
