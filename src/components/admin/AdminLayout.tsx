
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (value: string) => void;
  onLogout: () => void;
  apiConnected: boolean;
}

export const AdminLayout = ({ 
  children, 
  activeTab, 
  onTabChange, 
  onLogout,
  apiConnected 
}: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">PazProperty Admin</h1>
            <div className={`h-2 w-2 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {apiConnected ? 'API conectada' : 'API não conectada'}
            </span>
          </div>
          <Button 
            variant="ghost" 
            className="text-white hover:text-gray-200"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      
      <footer className="bg-slate-900 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} PazProperty - Administration
        </div>
      </footer>
    </div>
  );
};
