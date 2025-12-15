import { Badge } from "../ui/badge";

export function StatusBadge({
  status,
  variant = "outline",
}: {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
      case "pending":
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
      case "inactive":
      case "error":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <Badge variant={variant} className={`${getStatusColor(status)} capitalize`}>
      {status}
    </Badge>
  );
}
