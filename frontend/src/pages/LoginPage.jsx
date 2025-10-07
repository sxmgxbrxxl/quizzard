import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔹 Check in students collection
      const studentsRef = collection(db, "students");
      const studentQuery = query(studentsRef, where("studentNumber", "==", studentNumber.trim()));
      const studentSnapshot = await getDocs(studentQuery);

      // 🔹 Check in users collection (teachers)
      const usersRef = collection(db, "users");
      const teacherQuery = query(usersRef, where("email", "==", studentNumber.trim()));
      const teacherSnapshot = await getDocs(teacherQuery);

      let userRole = null;
      let emailToLogin = null;

      // 🔹 Case 1: Student login
      if (!studentSnapshot.empty) {
        const studentDoc = studentSnapshot.docs[0];
        const studentData = studentDoc.data();

        if (!studentData.email) {
          setError("No email found for this student. Please contact your teacher.");
          setLoading(false);
          return;
        }

        emailToLogin = studentData.email;
        userRole = "student";
      }
      // 🔹 Case 2: Teacher login
      else if (!teacherSnapshot.empty) {
        const teacherDoc = teacherSnapshot.docs[0];
        const teacherData = teacherDoc.data();

        if (!teacherData.email) {
          setError("No email found for this teacher account.");
          setLoading(false);
          return;
        }

        emailToLogin = teacherData.email;
        userRole = teacherData.role || "teacher";
      }
      // 🔹 Case 3: No record found
      else {
        setError("No record found. Please check your student number or email.");
        setLoading(false);
        return;
      }

      // ✅ Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, emailToLogin, password);

      // ✅ Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ Navigate based on role
      if (userRole === "teacher") {
        navigate("/teacher", { replace: true });
      } else {
        navigate("/studentDashboard", { replace: true });
      }

    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid password. Try using your birthday (M/D/YYYY).");
      } else if (err.code === "auth/user-not-found") {
        setError("Account not found.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Password Recovery
  const handleRecoverAccount = async () => {
    setError("");
    setRecoveryMessage("");
    if (!studentNumber) {
      setError("Please enter your student number or email first.");
      return;
    }

    try {
      // Check both collections
      const studentsRef = collection(db, "students");
      const studentQuery = query(studentsRef, where("studentNumber", "==", studentNumber.trim()));
      const studentSnapshot = await getDocs(studentQuery);

      const usersRef = collection(db, "users");
      const teacherQuery = query(usersRef, where("email", "==", studentNumber.trim()));
      const teacherSnapshot = await getDocs(teacherQuery);

      let emailToSend = "";

      if (!studentSnapshot.empty) {
        emailToSend = studentSnapshot.docs[0].data().email;
      } else if (!teacherSnapshot.empty) {
        emailToSend = teacherSnapshot.docs[0].data().email;
      }

      if (!emailToSend) {
        setError("No email associated with this account.");
        return;
      }

      await sendPasswordResetEmail(auth, emailToSend);
      setRecoveryMessage(`A password reset link has been sent to ${emailToSend}`);
      setRecovering(false);
    } catch (err) {
      console.error("Recovery error:", err);
      setError("Failed to send recovery email. Please try again later.");
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center font-Quizzard bg-gradient-to-br from-secondary to-primary">
      {/* Back button */}
      <div className="absolute top-10 left-10 text-white cursor-pointer bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 font-bold">
        <Link to="/" className="text-black">Back</Link>
      </div>

      {/* Login Card */}
      <div className="bg-white p-10 rounded-xl shadow-lg w-96">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center">Log In to Quizzard</h2>

          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}
          {recoveryMessage && (
            <div className="mb-4 text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
              {recoveryMessage}
            </div>
          )}

          {/* ID Number or Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="studentNumber">
              Student Number / Teacher Email
            </label>
            <input
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              type="text"
              id="studentNumber"
              placeholder="Enter your student number or email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-2">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              type="password"
              id="password"
              placeholder="Enter your password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Initial password: your birthday (M/D/YYYY)
            </p>
          </div>

          {/* Recover Account link */}
          <div className="text-right mb-4">
            <button
              type="button"
              onClick={() => setRecovering(true)}
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition-colors duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold">
              Contact your teacher
            </Link>
          </p>
        </form>
      </div>

      {/* Recover Account Modal */}
      {recovering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
            <h3 className="text-lg font-bold mb-3">Recover Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll send a password reset link to your registered email.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRecoverAccount}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition-colors duration-200 font-bold"
              >
                Send Link
              </button>
              <button
                onClick={() => setRecovering(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}