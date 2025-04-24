
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Users, FileText, LayoutDashboard } from "lucide-react";
import { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  apiConnected: boolean;
  user: User | null;
}

export const AdminLayout = ({
  children,
  activeTab,
  onTabChange,
  onLogout,
  apiConnected,
  user,
}: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-white border-r transition-width duration-300 ease-in-out flex-shrink-0 hidden md:block`}
      >
        <div className="h-16 flex items-center px-4 border-b">
          <h1 className={`font-bold text-lg ${isSidebarOpen ? "block" : "hidden"}`}>
            Administration
          </h1>
        </div>
        <div className="p-4">
          <nav className="space-y-2">
            <button
              onClick={() => onTabChange("declarations")}
              className={`w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === "declarations"
                  ? "bg-gray-100 text-primary font-medium"
                  : "hover:bg-gray-50"
              } ${!isSidebarOpen ? "justify-center" : ""}`}
            >
              <FileText className="h-5 w-5 mr-2" />
              <span className={`${isSidebarOpen ? "block" : "hidden"}`}>Declarações</span>
            </button>
            <button
              onClick={() => onTabChange("obras")}
              className={`w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === "obras"
                  ? "bg-gray-100 text-primary font-medium"
                  : "hover:bg-gray-50"
              } ${!isSidebarOpen ? "justify-center" : ""}`}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              <span className={`${isSidebarOpen ? "block" : "hidden"}`}>Obras</span>
            </button>
            <button
              onClick={() => onTabChange("crm")}
              className={`w-full text-left flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === "crm"
                  ? "bg-gray-100 text-primary font-medium"
                  : "hover:bg-gray-50"
              } ${!isSidebarOpen ? "justify-center" : ""}`}
            >
              <Users className="h-5 w-5 mr-2" />
              <span className={`${isSidebarOpen ? "block" : "hidden"}`}>CRM</span>
            </button>
          </nav>
        </div>
        
        <div className="absolute bottom-4 left-0 w-full px-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center" 
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className={`${isSidebarOpen ? "block" : "hidden"}`}>Déconnexion</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          
          <div className="md:hidden flex-1 text-center font-bold">Administration</div>

          <div className="flex items-center space-x-4">
            <div className={`h-2 w-2 rounded-full ${apiConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm text-gray-500 hidden md:inline">
              API Monday.com: {apiConnected ? "Connecté" : "Non connecté"}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(user?.user_metadata?.full_name || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>Mon compte</span>
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
