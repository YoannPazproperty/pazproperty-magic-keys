
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import { AuthProvider } from "@/hooks/auth";
import { UserCreationProvider } from "@/contexts/UserCreationContext";

const Admin = () => {
  return (
    <AuthProvider>
      <UserCreationProvider>
        <AdminDashboard />
      </UserCreationProvider>
    </AuthProvider>
  );
};

export default Admin;
