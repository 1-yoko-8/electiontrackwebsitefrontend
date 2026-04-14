import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ExportData from "./pages/ExportData";
import MapTracking from "./pages/MapTracking";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "map-tracking", element: <MapTracking /> },
      { path: "export", element: <ExportData /> }
    ],
  },
]);