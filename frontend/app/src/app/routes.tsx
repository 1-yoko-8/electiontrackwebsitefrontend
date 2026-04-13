import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ExportData from "./pages/ExportData";
import MapTracking from "./pages/MapTracking";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "map-tracking", element: <MapTracking /> },
      { path: "export", element: <ExportData /> }
    ],
  },
]);