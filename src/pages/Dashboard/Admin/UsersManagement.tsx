import ManageUsersTable from "@/components/admin/ManageUsersTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const UsersManagement = () => {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Manage Users</CardTitle>
          <CardDescription>
            View and manage all users. Update roles, approve, or suspend
            accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManageUsersTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
