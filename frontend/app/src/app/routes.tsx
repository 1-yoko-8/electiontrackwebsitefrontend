import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadDataset from "./pages/UploadDataset";
import ViewDataset from "./pages/ViewDataset";
import { TaskDay } from "./pages/TaskDay";
import ExportData from "./pages/ExportData";

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
      { path: "upload", element: <UploadDataset /> },
      { path: "dataset", element: <ViewDataset /> },
      { path: "task-day", element: <TaskDay /> },
      { path: "export", element: <ExportData /> },
    ],
  },
]);