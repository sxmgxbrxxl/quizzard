import "./styles/App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

// Student Side
import StudentDashboard from "./pages/studentSide/StudentDashboard";

// Teacher Side
import TeacherDashboard from "./pages/teacherSide/TeacherDashboard";
import ManageClasses from "./pages/teacherSide/ManageClasses";
import ManageQuizzes from "./pages/teacherSide/ManageQuizzes";
import ReportsAnalytics from "./pages/teacherSide/ReportsAnalytics";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        try {
          // 🔹 1. Check if user exists in students (by email)
          const studentQuery = query(
            collection(db, "students"),
            where("email", "==", user.email)
          );
          const studentSnap = await getDocs(studentQuery);

          // 🔹 2. Check if user exists in teachers (by UID)
          const teacherRef = doc(db, "users", user.uid);
          const teacherSnap = await getDoc(teacherRef);

          if (!studentSnap.empty) {
            // ✅ Student found
            setUserDoc(studentSnap.docs[0].data());
            setRole("student");
          } else if (teacherSnap.exists()) {
            // ✅ Teacher found
            const teacherData = teacherSnap.data();
            setUserDoc(teacherData);
            setRole(teacherData.role || "teacher");
          } else {
            // ❌ No matching record
            setUserDoc(null);
            setRole(null);
          }
        } catch (err) {
          console.error("Error fetching user document:", err);
        }
      } else {
        setAuthUser(null);
        setUserDoc(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 🔸 Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            !authUser ? (
              <LoginPage />
            ) : role === "teacher" ? (
              <Navigate to="/teacher" replace />
            ) : role === "student" ? (
              <Navigate to="/studentDashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="/signup" element={<SignUpPage />} />

        {/* 🔹 Student Dashboard */}
        <Route
          path="/studentDashboard"
          element={
            authUser && role === "student" ? (
              <StudentDashboard user={authUser} userDoc={userDoc} />
            ) : authUser && !role ? (
              <div className="min-h-screen flex items-center justify-center">
                <p>Loading user data...</p>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 🔹 Teacher Dashboard */}
        <Route
          path="/teacher"
          element={
            authUser && role === "teacher" ? (
              <TeacherDashboard user={authUser} userDoc={userDoc} />
            ) : authUser && !role ? (
              <div className="min-h-screen flex items-center justify-center">
                <p>Loading user data...</p>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route
            index
            element={
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">
                  Welcome to Smart Quiz!
                </h2>
                <p>
                  Select an option from the sidebar to manage your classes,
                  quizzes, or view analytics.
                </p>
              </div>
            }
          />
          <Route path="classes" element={<ManageClasses />} />
          <Route path="quizzes" element={<ManageQuizzes />} />
          <Route path="reports" element={<ReportsAnalytics />} />
        </Route>

        {/* 🔸 Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;