import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg p-4 h-screen fixed">
      <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
        Smart Quiz
      </h2>
      <nav className="flex flex-col gap-3">
        <Link to="/classes" className="hover:bg-blue-100 p-2 rounded">
          🏫 Manage Classes
        </Link>
        <Link to="/quizzes" className="hover:bg-blue-100 p-2 rounded">
          📝 Manage Quizzes
        </Link>
        <Link to="/reports" className="hover:bg-blue-100 p-2 rounded">
          📊 Reports & Analytics
        </Link>
      </nav>
    </div>
  );
}
