import ApprovedOrdersTable from "@/components/Manager/ApprovedOrders/ApprovedOrdersTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const ApprovedOrders = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Approved Orders</CardTitle>
          <CardDescription>
            Track and update your approved orders. Update timeline for orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovedOrdersTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovedOrders;
