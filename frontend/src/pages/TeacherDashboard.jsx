import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function TeacherDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome, Teacher!</h1>
        <Outlet />
      </div>
    </div>
  );
}
