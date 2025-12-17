import ManageProductsTable from "@/components/Manager/ManageProducts/ManageProductsTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const ManageProducts = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Your Products</CardTitle>
          <CardDescription>
            View and manage your products. Update products or delete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManageProductsTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageProducts;
