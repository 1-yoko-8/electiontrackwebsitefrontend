import * as React from "react";
import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Download,
  Shield,
  Activity,
  AlertTriangle,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { sidebarMenuButtonVariants } from "./ui/sidebar-variants";
import { Button } from "./ui/button";

/* ---------------- SIDE BAR COMPONENT ---------------- */

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
}

function Sidebar({ menuItems }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <aside
      className={`bg-white shadow-lg transition-all duration-300 flex flex-col ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        {sidebarOpen && (
          <h1 className="text-xl font-semibold text-gray-800 font-inter">
            Mobile Tracker
          </h1>
        )}

        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={
                sidebarMenuButtonVariants({
                  variant: isActive ? "outline" : "default",
                  size: sidebarOpen ? "default" : "sm"
                }) + " justify-start px-3"
              }
            >
              <item.icon className="w-5 h-5 shrink-0 mr-3 text-gray-700" />

              {sidebarOpen && (
                <span className="font-inter font-medium text-gray-800">
                  {item.label}
                </span>
              )}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}

/* ---------------- DASHBOARD LAYOUT ---------------- */

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: MapPin, label: "Map Tracking", path: "/map-tracking" },
  { icon: Download, label: "Export Reports", path: "/export" },
  { icon: Shield, label: "Admin", path: "/admin" },
  { icon: Activity, label: "Polling Status", path: "/polling-status" },
  { icon: AlertTriangle, label: "SOS", path: "/sos" }
];

export function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 font-inter">
            Police Mobile Party Tracker
          </h2>

          <Button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-inter font-medium">Logout</span>
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}