import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function TeacherDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      {/* Main Content Area - hindi na natatakpan ng sidebar */}
      <div className="flex-1 p-6 overflow-y-auto ml-0 lg:ml-0">
        <div className="max-w-7xl mx-auto mt-16 lg:mt-0">
          <h1 className="text-2xl font-bold mb-4">Welcome, Teacher!</h1>
          <Outlet />
        </div>
      </div>
    </div>
  );
}