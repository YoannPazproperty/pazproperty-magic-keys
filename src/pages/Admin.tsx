
import { useEffect } from "react";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import { ApiSettings } from "@/components/admin/ApiSettings";
import { NotificationSettings } from "@/components/admin/NotificationSettings";

const Admin = () => {
  // This is now just a wrapper component that imports and renders our refactored dashboard
  return <AdminDashboard />;
};

export default Admin;
