// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      // fetch role from Firestore
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.role === "teacher") navigate("/teacherDashboard");
        else navigate("/studentDashboard");
      } else {
        // no user doc found — fallback to landing or logout
        setError("No user profile found. Contact admin.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center font-Quizzard bg-gradient-to-br from-secondary to-primary">
      <div className="absolute top-10 left-10 text-white cursor-pointer bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 font-bold">
        <Link to="/" className="text-black">Back</Link>
      </div>

      <div className="bg-white p-10 rounded-xl shadow-lg w-96">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center">Log In to Quizzard</h2>

          {error && <div className="mb-4 text-red-600">{error}</div>}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              type="email"
              id="email"
              placeholder="user@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              type="password"
              id="password"
              placeholder="********"
              required
            />
          </div>

          <button
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-secondary transition-colors duration-200 font-bold"
            type="submit"
          >
            Log In
          </button>

          <p className="mt-4 text-center">
            Don't have an account? <Link to="/signup" className="text-primary font-bold">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
