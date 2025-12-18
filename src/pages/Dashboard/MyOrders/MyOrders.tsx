import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MyOrdersTable from "./MyOrdersTable";
const MyOrders = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Orders</CardTitle>
          <CardDescription>View, track or cancel your orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <MyOrdersTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyOrders;
