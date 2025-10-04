import "./styles/App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ManageClasses from "./pages/ManageClasses";
import ManageQuizzes from "./pages/ManageQuizzes";
import ReportsAnalytics from "./pages/ReportsAnalytics";

function App() {
  const [authUser, setAuthUser] = useState(null); // Firebase user
  const [userDoc, setUserDoc] = useState(null);   // Firestore user data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setAuthUser(user);
        try {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setUserDoc(snap.data());
          } else {
            setUserDoc(null);
          }
        } catch (err) {
          console.error("Error fetching user doc:", err);
          setUserDoc(null);
        }
      } else {
        setAuthUser(null);
        setUserDoc(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Student Dashboard (protected) */}
        <Route
          path="/studentDashboard"
          element={
            authUser && userDoc?.role === "student" ? (
              <StudentDashboard user={authUser} userDoc={userDoc} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Teacher Dashboard (protected) */}
        <Route
          path="/teacherDashboard"
          element={
            authUser && userDoc?.role === "teacher" ? (
              <TeacherDashboard user={authUser} userDoc={userDoc} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Teacher-only pages (protected) */}
        <Route
          path="/classes"
          element={
            authUser && userDoc?.role === "teacher" ? (
              <ManageClasses />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/quizzes"
          element={
            authUser && userDoc?.role === "teacher" ? (
              <ManageQuizzes />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            authUser && userDoc?.role === "teacher" ? (
              <ReportsAnalytics />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all → Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
