import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        <div className="p-4 mt-16">
          <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">
            Smart Quiz
          </h2>
          <nav className="flex flex-col gap-3">
            <Link to="classes" className="hover:bg-blue-100 p-2 rounded transition-colors">
              🏫 Manage Classes
            </Link>
            <Link to="quizzes" className="hover:bg-blue-100 p-2 rounded transition-colors">
              📝 Manage Quizzes
            </Link>
            <Link to="reports" className="hover:bg-blue-100 p-2 rounded transition-colors">
              📊 Reports & Analytics
            </Link>
            <button
              onClick={handleLogout}
              className="hover:bg-red-100 p-2 rounded text-red-600 mt-4 transition-colors text-left w-full"
            >
              🚪 Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Overlay when sidebar is open (mobile) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}
    </>
  );
}