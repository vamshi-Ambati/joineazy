import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiUrl from "../apiUrl"
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      data.role === "student"
        ? navigate("/student/dashboard")
        : navigate("/admin/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">
          Login
        </h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border mb-4 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full border mb-6 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105">
          Login
        </button>
        <p className="text-sm text-center text-gray-500 mt-4">
          Forgot your password?{" "}
          <a href="/reset" className="text-blue-600 hover:underline">
            Reset here
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
