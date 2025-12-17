import AllOrdersTable from "@/components/Admin/ManageAllOrders/AllOrdersTable";
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
            View and manage all orders. Update status, approve or reject orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AllOrdersTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default AllProductsManagement;
