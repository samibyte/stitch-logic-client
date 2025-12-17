import PendingOrdersTable from "@/components/Manager/PendingOrders/PendingOrdersTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const PendingOrders = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Pending Orders</CardTitle>
          <CardDescription>
            View and manage your pending orders. Approve or reject orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingOrdersTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingOrders;
