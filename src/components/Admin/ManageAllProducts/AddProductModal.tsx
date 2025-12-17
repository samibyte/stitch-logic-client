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
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product, PaymentOptions, Category } from "./AllProductsTable";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProductModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "electronics" as Category,
    price: 0,
    availableQuantity: 0,
    minOrderQuantity: 1,
    paymentOptions: "COD" as PaymentOptions,
    showOnHome: false,
  });

  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: async (productData: typeof formData) => {
      const res = await axiosSecure.post("/products", productData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to create product");
    },
  });

  const handleChange = (
    field: keyof typeof formData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProductMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Similar form fields as EditProductModal */}
          {/* You can reuse the same form structure */}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProductMutation.isPending}>
              {createProductMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
