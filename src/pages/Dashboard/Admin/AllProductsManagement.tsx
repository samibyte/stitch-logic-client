import AllProductsTable from "@/components/Admin/ManageAllProducts/AllProductsTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const AllProductsManagement = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">All Products</CardTitle>
          <CardDescription>
            View and manage all products. Update products, delete, or control
            visibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AllProductsTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default AllProductsManagement;
