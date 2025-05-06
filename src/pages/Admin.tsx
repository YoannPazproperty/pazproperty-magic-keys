
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import { AuthProvider } from "@/hooks/auth";

const Admin = () => {
  // We need to wrap the AdminDashboard with AuthProvider
  return (
    <AuthProvider>
      <AdminDashboard />
    </AuthProvider>
  );
};

export default Admin;
